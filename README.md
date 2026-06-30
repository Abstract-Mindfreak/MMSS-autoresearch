# MMSS Builder Migration Sandbox

Next.js 16 + `flexlayout-react` migration of the Flask MMSS builder with local Ollama-backed MMSS operations.

## Requirements

- Node.js with `npm`
- Python 3.11+
- Local Ollama running on `http://127.0.0.1:11434`

## Install

```powershell
cd D:\project\auto_research_and_nextjswithflexlayout-react
npm install
npm run db:generate
```

## Run App

Standard Next.js dev run:

```powershell
cd D:\project\auto_research_and_nextjswithflexlayout-react
npm run dev
```

Single-file Python launcher:

```powershell
cd D:\project\auto_research_and_nextjswithflexlayout-react
python .\run_app.py
```

Python launcher on custom port:

```powershell
cd D:\project\auto_research_and_nextjswithflexlayout-react
python .\run_app.py --port 5000
```

## Useful Commands

Generate Prisma client:

```powershell
npm run db:generate
```

Run lint:

```powershell
npm run lint
```

## Notes

- The project uses SQLite at `D:/project/auto_research_and_nextjswithflexlayout-react/db/custom.db`.
- Local Ollama is used for MMSS `evaluate`, `improve`, `compare`, and `prompt_tune` operations.
- The `Auto Research` panel now supports choosing a primary MMSS model, a comparison model, and a target topic before starting the loop.
