from flask import Flask
from flask_jwt_extended import JWTManager ,jwt_required
from flask_cors import CORS
from qr.qr_bp import qr_bp
from auth import auth_bp
import config

app = Flask(__name__)
app.config.from_object(config)  # config.py içindeki ayarları import ettim

CORS(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(qr_bp, url_prefix="/api/qr")

@app.route("/test")
def test():
    return "Backend calisiyor"

@app.route("/test-jwt")
@jwt_required()
def test_jwt():
    return "JWT calisiyor"

if __name__ == "__main__":
    app.run(debug=True)
