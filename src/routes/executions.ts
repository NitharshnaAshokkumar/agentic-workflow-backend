import { Router } from "express";
import { prisma } from "../prisma";
import { executorService } from "../services/executorService";

const router = Router();

router.post("/run/:workflowId", async (req, res) => {
  const executionId = await executorService.start(req.params.workflowId);
  res.json({ executionId });
});

router.get("/:executionId", async (req, res) => {
  const exec = await prisma.execution.findUnique({
    where: { id: req.params.executionId },
    include: {
      workflow: true,
      stepExecutions: { orderBy: { order: "asc" }, include: { step: true } }
    }
  });
  res.json(exec);
});

router.get("/workflow/:workflowId", async (req, res) => {
  const execs = await prisma.execution.findMany({
    where: { workflowId: req.params.workflowId },
    orderBy: { startedAt: "desc" }
  });
  res.json(execs);
});

export default router;
