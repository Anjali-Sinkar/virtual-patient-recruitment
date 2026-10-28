import os

# Database config — reads from environment variables (for Railway/Render/Heroku)
# Falls back to local dev values if env vars are not set
DB_CONFIG = {
    'host':     os.environ.get('DB_HOST', 'localhost'),
    'dbname':   os.environ.get('DB_NAME', 'virtual_patient_recruitment'),
    'user':     os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', ''),  # never commit a real password
    'port':     int(os.environ.get('DB_PORT', 5432))
}

MODEL_PATHS = {
    'hypertension': 'ml_models/hypertension_model.pkl',
    'arthritis':    'ml_models/arthritis_model.pkl',
    'migraine':     'ml_models/migraine_model.pkl',
    'phase1':       'ml_models/phase1_model.pkl'
}
