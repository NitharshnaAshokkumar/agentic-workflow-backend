import { llmService } from "./llmService";

export type CriteriaResult = { passed: boolean; reason: string };

class CriteriaService {
  async check(output: string, type: string, value?: string | null): Promise<CriteriaResult> {
    switch (type) {
      case "contains":
        return { passed: output.includes(value || ""), reason: `contains("${value}")` };

      case "regex":
        try {
          const re = new RegExp(value || "");
          return { passed: re.test(output), reason: `regex(${value})` };
        } catch (e: any) {
          return { passed: false, reason: `Invalid regex: ${e.message}` };
        }

      case "json_valid":
        try {
          JSON.parse(output);
          return { passed: true, reason: "Valid JSON" };
        } catch (e: any) {
          return { passed: false, reason: `Invalid JSON: ${e.message}` };
        }

      case "llm_judge":
        return await this.llmJudge(output, value || "");

      default:
        return { passed: true, reason: "No criteria => auto pass" };
    }
  }

  private async llmJudge(output: string, criteriaText: string): Promise<CriteriaResult> {
    const judgeModel = process.env.JUDGE_MODEL || "gpt-3.5-turbo";

    const prompt = `You are a strict evaluator.

Criteria:
${criteriaText}

Output:
${output}

Reply ONLY:
YES - reason
or
NO - reason`;

    const res = await llmService.callLLM(judgeModel, prompt);
    const text = (res.content || "").trim();
    return { passed: text.toUpperCase().startsWith("YES"), reason: text };
  }
}

export const criteriaService = new CriteriaService();
