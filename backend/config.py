import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

# PostgreSQL URL fix (Render uses postgres:// but SQLAlchemy needs postgresql://)
if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_TRACK_MODIFICATIONS = False

# JWT
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(hours=1)