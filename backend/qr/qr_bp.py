from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import qrcode
from PIL import Image, ImageDraw
import io
import base64
from models import db, QRCode, User

qr_bp = Blueprint('qr_bp', __name__)

def create_styled_qr(data, fg_color, bg_color, size, style):
    """Özel stil ile QR kod oluştur"""
    
    # Temel QR kod oluştur
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=size,
        border=4
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Basit renkli QR (tüm stiller için çalışır)
    img = qr.make_image(fill_color=fg_color, back_color=bg_color)
    
    # PIL Image'e dönüştür
    if not isinstance(img, Image.Image):
        img = img.convert('RGB')
    
    # Stil uygulamaları
    if style == "rounded":
        img = apply_rounded_style(img, fg_color, bg_color)
    elif style == "circle":
        img = apply_circle_style(img, fg_color, bg_color)
    elif style == "gapped":
        img = apply_gapped_style(img, fg_color, bg_color)
    
    return img

def apply_rounded_style(img, fg_color, bg_color):
    """Yuvarlatılmış köşeler uygula"""
    try:
        # Basit versiyon - sadece renkleri uygula
        return img
    except:
        return img

def apply_circle_style(img, fg_color, bg_color):
    """Daire şekli uygula"""
    try:
        # Basit versiyon - sadece renkleri uygula
        return img
    except:
        return img

def apply_gapped_style(img, fg_color, bg_color):
    """Aralıklı stil uygula"""
    try:
        # Basit versiyon - sadece renkleri uygula
        return img
    except:
        return img

@qr_bp.route("/generate", methods=['POST'])
@jwt_required()
def generate_qr():
    user_id = get_jwt_identity()
    data = request.json.get('data')
    
    # Özelleştirme parametreleri
    fg_color = request.json.get('fg_color', '#000000')
    bg_color = request.json.get('bg_color', '#FFFFFF')
    size = request.json.get('size', 10)
    style = request.json.get('style', 'square')
    
    if not data:
        return jsonify({'message': 'Data alanı zorunlu!'}), 400

    try:
        # Kullanıcının girdiği veriyle QR oluştur
        img = create_styled_qr(data, fg_color, bg_color, size, style)
        
        # Base64 olarak encode et
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        # Veritabanına kaydet
        new_qr = QRCode(data=data, qr_image=img_base64, user_id=user_id)
        db.session.add(new_qr)
        db.session.commit()

        return jsonify({
            'qr_id': new_qr.id,
            'qr_base64': img_base64,
            'created_at': new_qr.created_at.isoformat()
        }), 201
        
    except Exception as e:
        print(f"QR oluşturma hatası: {str(e)}")
        return jsonify({'message': f'QR kod oluşturulamadı: {str(e)}'}), 500


@qr_bp.route("/my-qr-codes", methods=['GET'])
@jwt_required()
def get_my_qr_codes():
    user_id = get_jwt_identity()
    
    qr_codes = QRCode.query.filter_by(user_id=user_id).order_by(QRCode.created_at.desc()).all()
    
    result = []
    for qr in qr_codes:
        result.append({
            'id': qr.id,
            'data': qr.data,
            'qr_base64': qr.qr_image,
            'created_at': qr.created_at.isoformat()
        })
    
    return jsonify(result), 200


@qr_bp.route("/delete/<int:qr_id>", methods=['DELETE'])
@jwt_required()
def delete_qr(qr_id):
    user_id = get_jwt_identity()
    
    qr_code = QRCode.query.filter_by(id=qr_id, user_id=user_id).first()
    
    if not qr_code:
        return jsonify({'message': 'QR kod bulunamadı'}), 404
    
    db.session.delete(qr_code)
    db.session.commit()
    
    return jsonify({'message': 'QR kod silindi'}), 200