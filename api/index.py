import os
import sys
import types

# Add project root and backend directory to Python sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

for path in [root_dir, backend_dir]:
    if path and path not in sys.path:
        sys.path.insert(0, path)

if "backend" not in sys.modules:
    try:
        import backend
    except ImportError:
        backend_pkg = types.ModuleType("backend")
        backend_pkg.__path__ = [backend_dir]
        backend_pkg.__file__ = os.path.join(backend_dir, "__init__.py")
        sys.modules["backend"] = backend_pkg

from backend.app.main import app

__all__ = ["app"]
