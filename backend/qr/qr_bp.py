from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import qrcode
import io
import base64

qr_bp = Blueprint('qr_bp', __name__)

@qr_bp.route("/generate", methods=['POST'])
@jwt_required()
def generate_qr():
    data = request.json.get('data')
    if not data:
        return jsonify({'message': 'Data alanı zorunlu!'}), 400

    # QR kod oluştur
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')

    # Base64 olarak encode et
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return jsonify({'qr_base64': img_base64}), 200
