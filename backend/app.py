from flask import Flask, request, jsonify
from flask_cors import CORS
import qrcode
import io
import base64

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200


@app.route("/generate-qr", methods=["POST"])
def generate_qr():
    data = request.json.get("data")

    if not data:
        return jsonify({"error": "QR içeriği boş olamaz"}), 400

    qr = qrcode.make(data)

    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)

    qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return jsonify({
        "message": "QR başarıyla oluşturuldu",
        "qr_base64": qr_base64
    }), 200


if __name__ == "__main__":
    app.run(debug=True)
