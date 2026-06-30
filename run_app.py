from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent


def run(command: list[str], env: dict[str, str]) -> int:
    # Для Windows добавляем shell=True, чтобы корректно отрабатывали .cmd файлы (npx, npm)
    is_windows = os.name == 'nt'
    process = subprocess.run(command, cwd=PROJECT_ROOT, env=env, shell=is_windows)
    return process.returncode


def ensure_node_modules(env: dict[str, str]) -> None:
    node_modules = PROJECT_ROOT / "node_modules"
    if node_modules.exists():
      return
    code = run(["npm", "install"], env)
    if code != 0:
      raise SystemExit(code)


def main() -> int:
    parser = argparse.ArgumentParser(description="Launch the MMSS Next.js app.")
    parser.add_argument("--port", type=int, default=3000, help="Port for Next.js dev server.")
    parser.add_argument(
        "--skip-install",
        action="store_true",
        help="Skip npm install even if node_modules is missing.",
    )
    args = parser.parse_args()

    env = os.environ.copy()
    env.setdefault(
        "DATABASE_URL",
        "file:D:/project/auto_research_and_nextjswithflexlayout-react/db/custom.db",
    )

    if not args.skip_install:
        ensure_node_modules(env)

    return run(["npx", "next", "dev", "-p", str(args.port)], env)


if __name__ == "__main__":
    raise SystemExit(main())
