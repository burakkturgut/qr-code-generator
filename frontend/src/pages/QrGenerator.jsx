import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const QrGenerator = () => {
    const [qrBase64, setQrBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inputData, setInputData] = useState("");
    const [myQrCodes, setMyQrCodes] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const navigate = useNavigate();

    // Kullanıcının QR kodlarını yükle
    const loadMyQrCodes = async () => {
        try {
            const response = await api.get("/api/qr/my-qr-codes");
            setMyQrCodes(response.data);
        } catch (err) {
            console.error("QR kodları yüklenemedi:", err);
        }
    };

    useEffect(() => {
        loadMyQrCodes();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!inputData.trim()) {
            setError("Lütfen bir veri girin!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.post("/api/qr/generate", {
                data: inputData
            });

            setQrBase64(`data:image/png;base64,${response.data.qr_base64}`);
            setInputData(""); // Input'u temizle
            loadMyQrCodes(); // Listeyi güncelle
        } catch (err) {
            console.error(err);
            setError("QR kodu oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (qrId) => {
        if (!window.confirm("Bu QR kodu silmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            await api.delete(`/api/qr/delete/${qrId}`);
            loadMyQrCodes(); // Listeyi güncelle
            if (qrBase64) {
                setQrBase64(null); // Gösterilen QR'ı temizle
            }
        } catch (err) {
            alert("QR kodu silinemedi!");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h2>QR Kod Oluşturucu</h2>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Çıkış Yap
                </button>
            </div>

            {/* QR Oluşturma Formu */}
            <div style={{
                padding: "20px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                marginBottom: "30px"
            }}>
                <h3>Yeni QR Kod Oluştur</h3>
                <form onSubmit={handleGenerate}>
                    <input
                        type="text"
                        placeholder="QR koda dönüştürülecek metin veya URL"
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        style={{
                            padding: "12px",
                            width: "100%",
                            boxSizing: "border-box",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            marginBottom: "10px"
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "12px 24px",
                            backgroundColor: loading ? "#ccc" : "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "16px",
                            width: "100%"
                        }}
                    >
                        {loading ? "Oluşturuluyor..." : "QR Kod Oluştur"}
                    </button>
                </form>

                {error && (
                    <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
                )}

                {qrBase64 && (
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <h4>Oluşturulan QR Kod:</h4>
                        <img
                            src={qrBase64}
                            alt="QR Kod"
                            style={{
                                width: "300px",
                                height: "300px",
                                border: "2px solid #ddd",
                                borderRadius: "8px",
                                padding: "10px",
                                backgroundColor: "white"
                            }}
                        />
                        <div style={{ marginTop: "10px" }}>
                            <a
                                href={qrBase64}
                                download="qr-code.png"
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#2196F3",
                                    color: "white",
                                    textDecoration: "none",
                                    borderRadius: "4px",
                                    display: "inline-block"
                                }}
                            >
                                İndir
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* QR Geçmişi */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Geçmiş QR Kodlarım ({myQrCodes.length})</h3>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        {showHistory ? "Gizle" : "Göster"}
                    </button>
                </div>

                {showHistory && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                        gap: "20px",
                        marginTop: "20px"
                    }}>
                        {myQrCodes.length === 0 ? (
                            <p style={{ color: "#666" }}>Henüz QR kodunuz yok.</p>
                        ) : (
                            myQrCodes.map((qr) => (
                                <div
                                    key={qr.id}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "15px",
                                        backgroundColor: "white",
                                        textAlign: "center"
                                    }}
                                >
                                    <img
                                        src={`data:image/png;base64,${qr.qr_base64}`}
                                        alt="QR Kod"
                                        style={{
                                            width: "150px",
                                            height: "150px",
                                            marginBottom: "10px"
                                        }}
                                    />
                                    <p style={{
                                        fontSize: "12px",
                                        color: "#666",
                                        wordBreak: "break-all",
                                        marginBottom: "5px"
                                    }}>
                                        {qr.data.length > 50 ? qr.data.substring(0, 50) + "..." : qr.data}
                                    </p>
                                    <p style={{ fontSize: "11px", color: "#999", marginBottom: "10px" }}>
                                        {new Date(qr.created_at).toLocaleString('tr-TR')}
                                    </p>
                                    <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                                        <a
                                            href={`data:image/png;base64,${qr.qr_base64}`}
                                            download={`qr-${qr.id}.png`}
                                            style={{
                                                padding: "6px 12px",
                                                backgroundColor: "#4CAF50",
                                                color: "white",
                                                textDecoration: "none",
                                                borderRadius: "4px",
                                                fontSize: "12px"
                                            }}
                                        >
                                            İndir
                                        </a>
                                        <button
                                            onClick={() => handleDelete(qr.id)}
                                            style={{
                                                padding: "6px 12px",
                                                backgroundColor: "#f44336",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px"
                                            }}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QrGenerator;