import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validasyon
        if (!email || !password || !confirmPassword) {
            setError("Tüm alanları doldurun!");
            return;
        }

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor!");
            return;
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalı!");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register", {
                email,
                password,
            });

            alert("Kayıt başarılı! Giriş yapabilirsiniz.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.msg || "Kayıt başarısız!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
            <h2>Kayıt Ol</h2>

            {error && (
                <div style={{
                    padding: "10px",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    borderRadius: "4px",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
                    <input
                        type="email"
                        placeholder="ornek@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: "10px",
                            width: "100%",
                            boxSizing: "border-box",
                            border: "1px solid #ccc",
                            borderRadius: "4px"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>Şifre:</label>
                    <input
                        type="password"
                        placeholder="En az 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: "10px",
                            width: "100%",
                            boxSizing: "border-box",
                            border: "1px solid #ccc",
                            borderRadius: "4px"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>Şifre Tekrar:</label>
                    <input
                        type="password"
                        placeholder="Şifreyi tekrar girin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                            padding: "10px",
                            width: "100%",
                            boxSizing: "border-box",
                            border: "1px solid #ccc",
                            borderRadius: "4px"
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "12px",
                        width: "100%",
                        backgroundColor: loading ? "#ccc" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "16px"
                    }}
                >
                    {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                </button>
            </form>

            <p style={{ marginTop: "20px", textAlign: "center" }}>
                Zaten hesabın var mı? <a href="/login" style={{ color: "#2196F3" }}>Giriş Yap</a>
            </p>
        </div>
    );
};

export default Register;