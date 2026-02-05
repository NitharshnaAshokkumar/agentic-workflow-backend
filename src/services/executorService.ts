import { prisma } from "../prisma";
import { llmService } from "./llmService";
import { criteriaService } from "./criteriaService";
import { buildPrompt } from "../utils/context";

class ExecutorService {
  async start(workflowId: string) {
    const execution = await prisma.execution.create({
      data: { workflowId, status: "running" }
    });

    // run async
    this.run(execution.id, workflowId).catch(async (e) => {
      console.error("Execution crashed:", e);
      await prisma.execution.update({
        where: { id: execution.id },
        data: { status: "failed", completedAt: new Date() }
      });
    });

    return execution.id;
  }

  private async run(executionId: string, workflowId: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { order: "asc" } } }
    });
    if (!workflow) throw new Error("Workflow not found");

    // Create pending step records so UI can show all steps
    for (const step of workflow.steps) {
      await prisma.stepExecution.create({
        data: { executionId, stepId: step.id, order: step.order, status: "pending", prompt: "" }
      });
    }

    let prevOutput: string | null = null;
    let totalCost = 0;

    for (const step of workflow.steps) {
      const stepExec = await prisma.stepExecution.findFirstOrThrow({
        where: { executionId, stepId: step.id }
      });

      const prompt = buildPrompt(step.prompt, prevOutput, step.contextMode);

      await prisma.stepExecution.update({
        where: { id: stepExec.id },
        data: { status: "running", prompt, startedAt: new Date() }
      });

      let attempts = 0;
      let lastReason = "";
      let lastError: string | null = null;

      while (attempts < step.maxRetries) {
        attempts++;
        await prisma.stepExecution.update({ where: { id: stepExec.id }, data: { attempts } });

        try {
          const llm = await llmService.callLLM(step.model, prompt);
          const cost = llmService.estimateCostUSD(llm.tokensUsed);
          totalCost += cost;

          const check = await criteriaService.check(llm.content, step.criteriaType, step.criteriaValue);
          lastReason = check.reason;

          await prisma.stepExecution.update({
            where: { id: stepExec.id },
            data: {
              response: llm.content,
              tokensUsed: llm.tokensUsed,
              cost,
              criteriaPassed: check.passed,
              criteriaReason: check.reason
            }
          });

          if (check.passed) {
            await prisma.stepExecution.update({
              where: { id: stepExec.id },
              data: { status: "completed", passed: true, completedAt: new Date() }
            });
            prevOutput = llm.content;
            break;
          }
        } catch (e: any) {
          lastError = e.message;
        }
      }

      const updated = await prisma.stepExecution.findUniqueOrThrow({ where: { id: stepExec.id } });
      if (!updated.passed) {
        await prisma.stepExecution.update({
          where: { id: stepExec.id },
          data: { status: "failed", error: lastError || `Failed: ${lastReason}`, completedAt: new Date() }
        });

        await prisma.execution.update({
          where: { id: executionId },
          data: { status: "failed", totalCost, completedAt: new Date() }
        });
        return;
      }
    }

    await prisma.execution.update({
      where: { id: executionId },
      data: { status: "completed", totalCost, completedAt: new Date() }
    });
  }
}

export const executorService = new ExecutorService();
