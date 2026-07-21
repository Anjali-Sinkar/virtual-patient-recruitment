"""
Fix script: Re-saves ML models to be compatible with the current scikit-learn version.
Run once from the backend/ directory: python fix_models.py
"""

import pickle
import os
import sys

# ─── Compatibility Patch ───────────────────────────────────────────────────
# sklearn 1.8 removed _RemainderColsList that older models (saved with 1.6.x)
# reference during unpickling. We inject a shim so pickle can deserialize them,
# then re-save with the new sklearn format.

import sklearn.compose._column_transformer as _ct

class _RemainderColsList(list):
    """Compatibility shim for models saved with sklearn 1.3–1.6."""
    def __reduce__(self):
        return (list, (list(self),))

if not hasattr(_ct, '_RemainderColsList'):
    _ct._RemainderColsList = _RemainderColsList
    import sklearn.compose
    sklearn.compose._RemainderColsList = _RemainderColsList
    print("✅ Compatibility patch applied (_RemainderColsList injected)")
else:
    print("ℹ️  _RemainderColsList already exists — no patch needed")

# ─── Fix Models ────────────────────────────────────────────────────────────
MODELS_TO_FIX = [
    'ml_models/hypertension_model.pkl',
    'ml_models/arthritis_model.pkl',
    'ml_models/migraine_model.pkl',
]

success_count = 0
fail_count = 0

for path in MODELS_TO_FIX:
    name = os.path.basename(path)
    if not os.path.exists(path):
        print(f"⚠️  Not found: {path}")
        continue

    print(f"\n🔄 Processing {name}...")
    try:
        # Load with the compatibility patch active
        with open(path, 'rb') as f:
            model = pickle.load(f)
        print(f"   ✅ Loaded successfully: {type(model).__name__}")

        # Re-save in the current sklearn format
        backup_path = path + '.bak'
        os.replace(path, backup_path)          # keep a backup just in case
        with open(path, 'wb') as f:
            pickle.dump(model, f)
        print(f"   ✅ Re-saved successfully (backup at {backup_path})")
        success_count += 1

    except Exception as e:
        print(f"   ❌ Failed: {e}")
        fail_count += 1

# ─── Summary ───────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
print(f"Done! ✅ Fixed: {success_count}  ❌ Failed: {fail_count}")
if fail_count == 0:
    print("All models are now compatible. Restart the Flask server to apply.")
