from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from auth import auth_bp
import config

app = Flask(__name__)
app.config.from_object(config)  # config.py icindeki ayarları import ettim.

CORS(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/auth")

if __name__ == "__main__":
    app.run(debug=True)
