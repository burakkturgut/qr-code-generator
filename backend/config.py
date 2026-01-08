import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
SQLALCHEMY_TRACK_MODIFICATIONS = False

# JWT
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(hours=1) # 1 Saatlik bir token süresi olunca otomatik olarak geçersiz kılıyor bunu güvenlik için yaptım.