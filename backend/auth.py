from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from flask_bcrypt import Bcrypt


auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

# Geçici test kullanıcısı (ileride DB olacak)
fake_user = {
    "id": 1,
    "email": "admin@test.com",
    "password": bcrypt.generate_password_hash("123456").decode("utf-8")
}

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if email != fake_user["email"]:
        return jsonify({"msg": "Invalid credentials"}), 401

    if not bcrypt.check_password_hash(fake_user["password"], password):
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(identity=str(fake_user["id"]))

    return jsonify(access_token=token)

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()

    return jsonify({
        "user_id": user_id,
        "message": "JWT works. You are authenticated."
    })
