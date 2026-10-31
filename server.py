"""Compatibility launcher for the Node.js build and preview server."""
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parent
result = subprocess.run(['node', 'scripts/build.mjs'], cwd=root)
if result.returncode:
    sys.exit(result.returncode)
try:
    sys.exit(subprocess.call(['node', 'scripts/serve.mjs'], cwd=root))
except KeyboardInterrupt:
    pass
