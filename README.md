# Agentic Workflow Builder

An Agentic Workflow Builder that allows users to design, execute, and monitor multi-step AI workflows.  
Each step is an autonomous AI task with configurable models, prompts, completion criteria, retries, and context passing.

The system automates chaining AI agents together, handling retries, validation, cost tracking, and execution history.


## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite

### LLM Integration
- Unbound API (kimi-k2 models)
- Automatic fallback to mock LLM when provider is unavailable

1. User creates a workflow with ordered steps
2. Each step defines:
   - model
   - prompt
   - completion criteria
   - retry limit
3. On execution:
   - Step 1 calls the LLM
   - Output is evaluated against completion criteria
   - If failed → retry until limit
   - If passed → output is injected as context into next step
4. Workflow continues until:
   - all steps complete, or
   - a step permanently fails




## Bonus Features Implemented

- Configurable retry limit per step
- Cost tracking per step and per execution
- Automatic fallback to mock LLM on provider failure
- Execution history with full logs
- Context passing modes (full, summary, code-only)
- Graceful failure handling

## Demo Video

📽️ Demo Video Link: https://www.loom.com/share/aee41a5d1b934443aaf4c9562768b469
Code Logic explanation:https://www.loom.com/share/27691a99f99142f1854b18976be59deb

