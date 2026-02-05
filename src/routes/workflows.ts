import { Router } from "express";
import { prisma } from "../prisma";
import { z } from "zod";

const router = Router();

const StepSchema = z.object({
  name: z.string(),
  model: z.string(),
  prompt: z.string(),
  criteriaType: z.string(),
  criteriaValue: z.string().nullable().optional(),
  contextMode: z.string(),
  maxRetries: z.number().int().min(1).max(10)
});

const WorkflowSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  steps: z.array(StepSchema)
});

router.get("/", async (_req, res) => {
  const workflows = await prisma.workflow.findMany({
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" }
  });
  res.json(workflows);
});

router.get("/:id", async (req, res) => {
  const wf = await prisma.workflow.findUnique({
    where: { id: req.params.id },
    include: { steps: { orderBy: { order: "asc" } } }
  });
  res.json(wf);
});

router.post("/", async (req, res) => {
  const data = WorkflowSchema.parse(req.body);

  const wf = await prisma.workflow.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      steps: { create: data.steps.map((s, idx) => ({ ...s, order: idx, criteriaValue: s.criteriaValue ?? null })) }
    },
    include: { steps: true }
  });

  res.json(wf);
});

router.put("/:id", async (req, res) => {
  const data = WorkflowSchema.parse(req.body);
  const id = req.params.id;

  await prisma.step.deleteMany({ where: { workflowId: id } });

  const wf = await prisma.workflow.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description ?? null,
      steps: { create: data.steps.map((s, idx) => ({ ...s, order: idx, criteriaValue: s.criteriaValue ?? null })) }
    },
    include: { steps: { orderBy: { order: "asc" } } }
  });

  res.json(wf);
});

router.delete("/:id", async (req, res) => {
  await prisma.workflow.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
