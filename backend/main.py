import os
import sys
import types

# Ensure backend root and project root are in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
for d in [current_dir, parent_dir]:
    if d and d not in sys.path:
        sys.path.insert(0, d)

# If 'backend' package cannot be imported normally (e.g. when Vercel deploys
# the 'backend' folder as the service root), create an in-memory package alias
# for 'backend' pointing to current_dir so all `from backend.app...` imports resolve cleanly.
if "backend" not in sys.modules:
    try:
        import backend
    except ImportError:
        backend_pkg = types.ModuleType("backend")
        backend_pkg.__path__ = [current_dir]
        backend_pkg.__file__ = os.path.join(current_dir, "__init__.py")
        sys.modules["backend"] = backend_pkg

from backend.app.main import app

__all__ = ["app"]

