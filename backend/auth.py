from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from flask_bcrypt import Bcrypt
from models import db, User

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"msg": "Email ve şifre gerekli"}), 400
    
    # Email zaten kayıtlı mı?
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Bu email zaten kayıtlı"}), 400
    
    # Şifreyi hashle
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    
    # Yeni kullanıcı oluştur
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"msg": "Kayıt başarılı!"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    
    email = data.get("email")
    password = data.get("password")
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"msg": "Geçersiz kullanıcı adı veya şifre"}), 401
    
    token = create_access_token(identity=str(user.id))
    
    return jsonify(access_token=token)


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "Kullanıcı bulunamadı"}), 404
    
    return jsonify({
        "user_id": user.id,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    })