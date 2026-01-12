from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from qr.qr_bp import qr_bp
from auth import auth_bp
import config
from models import db
from flask_migrate import Migrate  

app = Flask(__name__)
app.config.from_object(config)

# Database initialize
db.init_app(app)
migrate = Migrate(app, db)

CORS(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(qr_bp, url_prefix="/api/qr")

# Veritabanı tablolarını oluştur
with app.app_context():
    db.create_all()
    print(" Database tables created!")

@app.route("/test")
def test():
    return "Backend calisiyor"

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)