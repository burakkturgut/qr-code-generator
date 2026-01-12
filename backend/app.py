from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from qr.qr_bp import qr_bp
from auth import auth_bp
import config
from models import db
from flask_migrate import Migrate
import os

app = Flask(__name__)
app.config.from_object(config)

# Database initialize
db.init_app(app)
migrate = Migrate(app, db)

# CORS - Frontend URL'ini ekle
CORS(app, resources={
    r"/*": {
        "origins": ["https://qr-frontend.vercel.app", "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(qr_bp, url_prefix="/api/qr")

# Veritabanı tablolarını oluştur
with app.app_context():
    db.create_all()
    print("✅ Database tables created!")

@app.route("/")
def home():
    return {"message": "QR Code API is running!", "status": "ok"}

@app.route("/test")
def test():
    return "Backend calisiyor"

@app.route("/health")
def health():
    return {"status": "healthy"}, 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)