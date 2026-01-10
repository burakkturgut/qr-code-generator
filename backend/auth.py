from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from flask_bcrypt import Bcrypt
from models import db, User, QRCode

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

# Yeni kullanıcı oluşturmak
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
    
    # Yeni kullanıcı oluştur ORM ile bu sayede SQL yazmadan kullanıcı ekleniyor.
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"msg": "Kayıt başarılı!"}), 201

# Kullanıcı giriş kısmı
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

# Hangi kullanıcı girdiyse onun profilini getirme

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "Kullanıcı bulunamadı"}), 404
    
    # Kullanıcının ürettiği QR sayısı
    total_qr = QRCode.query.filter_by(user_id=user.id).count()
    
    return jsonify({
        "user_id": user.id,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
        "total_qr_codes": total_qr
    })


# EMAIL değiştirme
@auth_bp.route("/change-email", methods=["PUT"])
@jwt_required()
def change_email():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "Kullanıcı bulunamadı"}), 404
    
    data = request.get_json()
    new_email = data.get("new_email")
    password = data.get("password")
    
    if not new_email or not password:
        return jsonify({"msg": "Yeni email ve şifre gerekli"}), 400
    
    # Şifre kontrolü
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"msg": "Geçersiz şifre"}), 401
    
    # Email zaten kullanılıyor mu?
    if User.query.filter_by(email=new_email).first():
        return jsonify({"msg": "Bu email zaten kullanılıyor"}), 400
    
    user.email = new_email
    db.session.commit()
    
    return jsonify({"msg": "Email başarıyla değiştirildi", "new_email": new_email})


# Şifre değiştirme
@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "Kullanıcı bulunamadı"}), 404
    
    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        return jsonify({"msg": "Mevcut ve yeni şifre gerekli"}), 400
    
    # Mevcut şifre kontrolü
    if not bcrypt.check_password_hash(user.password, current_password):
        return jsonify({"msg": "Mevcut şifre yanlış"}), 401
    
    # Yeni şifre çok kısa mı?
    if len(new_password) < 6:
        return jsonify({"msg": "Yeni şifre en az 6 karakter olmalı"}), 400
    
    # Yeni şifreyi hashle ve kaydet
    user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    
    return jsonify({"msg": "Şifre başarıyla değiştirildi"})

# Hesap silme
@auth_bp.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "Kullanıcı bulunamadı"}), 404
    
    data = request.get_json()
    password = data.get("password")
    
    if not password:
        return jsonify({"msg": "Şifre gerekli"}), 400
    
    # Şifre kontrolü
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"msg": "Geçersiz şifre"}), 401
    
    # Kullanıcıyı sil (QR kodlar cascade ile silinecek)
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"msg": "Hesap başarıyla silindi"})