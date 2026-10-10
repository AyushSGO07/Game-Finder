import os
import sys

# Ensure backend root and project root are in sys.path for Vercel Serverless Function imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
for d in [current_dir, parent_dir]:
    if d not in sys.path:
        sys.path.insert(0, d)

try:
    from backend.app.main import app
except ImportError:
    from app.main import app

__all__ = ["app"]
