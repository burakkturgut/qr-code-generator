import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const QrGenerator = () => {
    const { t } = useTranslation();
    const [qrBase64, setQrBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inputData, setInputData] = useState("");
    const [myQrCodes, setMyQrCodes] = useState([]);
    const [showHistory, setShowHistory] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // QR Özelleştirme
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [qrSize, setQrSize] = useState(10);

    // Filtreleme
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");

    const [selectedQrIds, setSelectedQrIds] = useState([]); // Seçili QR ID'leri
    const [isExporting, setIsExporting] = useState(false); // Export yükleniyor mu?

    const navigate = useNavigate();

    const loadMyQrCodes = async () => {
        try {
            const response = await api.get("/api/qr/my-qr-codes");

            const qrList = Array.isArray(response.data)
                ? response.data
                : response.data.qr_codes || response.data.data || [];

            setMyQrCodes(qrList);
        } catch (err) {
            console.error("QR kodları yüklenemedi:", err);
            setMyQrCodes([]); // fallback
        }
    };


    useEffect(() => {
        loadMyQrCodes();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!inputData.trim()) {
            setError(t('qrGenerator.enterData'));
            return;
        }

        setLoading(true);
        setError(null);

        try {

            const response = await api.post("/api/qr/generate", {
                data: inputData,
                fg_color: fgColor,
                bg_color: bgColor,
                size: qrSize,
                style: "square",
            });


            setQrBase64(`data:image/png;base64,${response.data.qr_base64}`);
            setInputData("");
            loadMyQrCodes();
            showToastMessage("✅ QR kod başarıyla oluşturuldu!");
        } catch (err) {
            console.error(err);
            setError(t('qrGenerator.createError'));
            showToastMessage("❌ QR kod oluşturulamadı!");
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (qrId) => {
        if (!window.confirm(t('qrHistory.deleteConfirm'))) {
            return;
        }

        try {
            await api.delete(`/api/qr/delete/${qrId}`);
            loadMyQrCodes();
            if (qrBase64) {
                setQrBase64(null);
            }
        } catch (err) {
            alert("QR kodu silinemedi!");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    // Toast göster
    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // WhatsApp paylaşma
    const shareWhatsApp = (qrData) => {
        const text = encodeURIComponent(`QR Kod içeriği: ${qrData}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const getFilteredQrCodes = () => {
        let filtered = [...myQrCodes];

        if (searchTerm) {
            filtered = filtered.filter(qr =>
                qr.data.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const now = new Date();
        if (dateFilter === "today") {
            filtered = filtered.filter(qr => {
                const qrDate = new Date(qr.created_at);
                return qrDate.toDateString() === now.toDateString();
            });
        } else if (dateFilter === "week") {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(qr => new Date(qr.created_at) > weekAgo);
        } else if (dateFilter === "month") {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter(qr => new Date(qr.created_at) > monthAgo);
        }

        if (sortOrder === "newest") {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return filtered;
    };

    const filteredQrCodes = getFilteredQrCodes();

    // ⬇️ BUNLARI EKLE ⬇️
    // QR seçme fonksiyonları
    const toggleQrSelection = (qrId) => {
        setSelectedQrIds(prev =>
            prev.includes(qrId)
                ? prev.filter(id => id !== qrId)
                : [...prev, qrId]
        );
    };

    const selectAllQrs = () => {
        if (selectedQrIds.length === filteredQrCodes.length) {
            setSelectedQrIds([]); // Tümünü kaldır
        } else {
            setSelectedQrIds(filteredQrCodes.map(qr => qr.id)); // Tümünü seç
        }
    };

    // PDF Export fonksiyonu
    const exportToPdf = async () => {
        if (selectedQrIds.length === 0) {
            showToastMessage(" Lütfen en az bir QR kod seçin!");
            return;
        }

        setIsExporting(true);

        try {
            // jsPDF kütüphanesini dinamik olarak yükle
            const { jsPDF } = await import('jspdf');

            const pdf = new jsPDF();
            const selectedQrs = myQrCodes.filter(qr => selectedQrIds.includes(qr.id));

            let yPosition = 20;

            selectedQrs.forEach((qr, index) => {
                if (index > 0) {
                    pdf.addPage(); // Her QR için yeni sayfa
                    yPosition = 20;
                }

                // Başlık
                pdf.setFontSize(16);
                pdf.text('QR Kod', 105, yPosition, { align: 'center' });
                yPosition += 10;

                // QR Data
                pdf.setFontSize(10);
                pdf.text(`İçerik: ${qr.data.substring(0, 50)}${qr.data.length > 50 ? '...' : ''}`, 20, yPosition);
                yPosition += 10;

                // Tarih
                pdf.text(`Oluşturulma: ${new Date(qr.created_at).toLocaleString('tr-TR')}`, 20, yPosition);
                yPosition += 15;

                // QR resmi
                const imgData = `data:image/png;base64,${qr.qr_base64}`;
                pdf.addImage(imgData, 'PNG', 55, yPosition, 100, 100);
            });

            // PDF'i indir
            pdf.save(`qr-codes-${new Date().getTime()}.pdf`);
            showToastMessage(` ${selectedQrs.length} QR kod PDF olarak indirildi!`);
            setSelectedQrIds([]); // Seçimi temizle

        } catch (error) {
            console.error('PDF oluşturma hatası:', error);
            showToastMessage(" PDF oluşturulamadı!");
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
            {showToast && (
                <>
                    <div className="fixed top-20 right-4 z-[100]" style={{ animation: 'slideIn 0.3s ease-out' }}>
                        <div className="bg-white border-2 rounded-xl shadow-2xl px-6 py-4 flex items-center space-x-3"
                            style={{
                                borderColor: toastMessage.includes('✅') ? '#10b981' : '#ef4444',
                                minWidth: '300px'
                            }}>
                            <span className="text-lg font-medium text-gray-800">{toastMessage}</span>
                        </div>
                    </div>
                    <style>{`
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `}</style>
                </>
            )}
            <header className="backdrop-blur-xl bg-white/80 shadow-lg sticky top-0 z-50 border-b" style={{ borderColor: 'rgba(139, 21, 56, 0.1)' }}>
                <div className="h-1" style={{ background: 'linear-gradient(90deg, #8B1538 0%, #D4AF37 50%, #8B1538 100%)' }}></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{
                                background: 'linear-gradient(135deg, #8B1538 0%, #D4AF37 100%)'
                            }}>
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>{t('dashboard.title')}</h1>
                        </div>
                        <div className="flex items-center space-x-3 px-2 sm:px-4">
                            {/* <LanguageSwitcher />  silindi ilerde eklenebilir! */}
                            <button
                                onClick={() => navigate("/settings")}
                                className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    color: '#374151',
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="hidden sm:inline">{t('common.settings')}</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-2 sm:px-4 py-2 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #8B1538 0%, #D4AF37 100%)' }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">{t('common.logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl group" style={{ borderColor: '#e5e7eb' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{t('dashboard.totalQr')}</p>
                                <p className="text-4xl font-bold mt-2" style={{ color: '#1a1a1a' }}>{myQrCodes.length}</p>
                            </div>
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(139, 21, 56, 0.1)',
                                boxShadow: '0 0 20px rgba(139, 21, 56, 0)'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 21, 56, 0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 21, 56, 0)'}>
                                <svg className="w-7 h-7" style={{ color: '#8B1538' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl group" style={{ borderColor: '#e5e7eb' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{t('dashboard.thisWeek')}</p>
                                <p className="text-4xl font-bold mt-2" style={{ color: '#1a1a1a' }}>
                                    {myQrCodes.filter(qr => {
                                        const date = new Date(qr.created_at);
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return date > weekAgo;
                                    }).length}
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                boxShadow: '0 0 20px rgba(212, 175, 55, 0)'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0)'}>
                                <svg className="w-7 h-7" style={{ color: '#D4AF37' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl group" style={{ borderColor: '#e5e7eb' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{t('dashboard.lastQr')}</p>
                                <p className="text-lg font-semibold mt-2" style={{ color: '#1a1a1a' }}>
                                    {myQrCodes.length > 0
                                        ? new Date(myQrCodes[0].created_at).toLocaleDateString('tr-TR')
                                        : t('dashboard.noQrYet')
                                    }
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(139, 21, 56, 0.1)',
                                boxShadow: '0 0 20px rgba(139, 21, 56, 0)'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0)'}>
                                <svg className="w-7 h-7" style={{ color: '#8B1538' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border" style={{ borderColor: '#e5e7eb' }}>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                            background: 'linear-gradient(135deg, #8B1538 0%, #D4AF37 100%)'
                        }}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>{t('qrGenerator.createNew')}</h2>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                                {t('qrGenerator.textOrUrl')}
                            </label>
                            <input
                                type="text"
                                placeholder={t('qrGenerator.textPlaceholder')}
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition duration-300"
                                style={{
                                    borderColor: '#e5e7eb',
                                    color: '#1a1a1a'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border" style={{ borderColor: '#e5e7eb' }}>
                            <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: '#1a1a1a' }}>
                                <svg className="w-5 h-5 mr-2" style={{ color: '#8B1538' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                {t('qrGenerator.customization')}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                                        {t('qrGenerator.qrColor')}
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            className="w-16 h-12 rounded-lg border-2 cursor-pointer"
                                            style={{ borderColor: '#e5e7eb' }}
                                        />
                                        <input
                                            type="text"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                                            style={{ borderColor: '#e5e7eb', color: '#1a1a1a' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                                        {t('qrGenerator.bgColor')}
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="w-16 h-12 rounded-lg border-2 cursor-pointer"
                                            style={{ borderColor: '#e5e7eb' }}
                                        />
                                        <input
                                            type="text"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2"
                                            style={{ borderColor: '#e5e7eb', color: '#1a1a1a' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                                    {t('qrGenerator.qrSize')}: {qrSize}
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="15"
                                    value={qrSize}
                                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    style={{ accentColor: '#D4AF37' }}
                                />
                                <div className="flex justify-between text-xs mt-1" style={{ color: '#6b7280' }}>
                                    <span>{t('qrGenerator.small')}</span>
                                    <span>{t('qrGenerator.medium')}</span>
                                    <span>{t('qrGenerator.large')}</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-semibold mb-3" style={{ color: '#374151' }}>
                                    {t('qrGenerator.quickColors')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { fg: "#000000", bg: "#FFFFFF", name: t('qrGenerator.classic') },
                                        { fg: "#1E40AF", bg: "#EFF6FF", name: t('qrGenerator.blue') },
                                        { fg: "#DC2626", bg: "#FEF2F2", name: t('qrGenerator.red') },
                                        { fg: "#059669", bg: "#F0FDF4", name: t('qrGenerator.green') },
                                        { fg: "#8B1538", bg: "#FFF5F7", name: "Bordo" },
                                        { fg: "#D4AF37", bg: "#FFFEF0", name: "Gold" },
                                    ].map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => {
                                                setFgColor(preset.fg);
                                                setBgColor(preset.bg);
                                            }}
                                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-md"
                                            style={{
                                                color: preset.fg,
                                                backgroundColor: preset.bg,
                                                border: `2px solid ${preset.fg}`
                                            }}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                <p className="font-medium text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{ background: 'linear-gradient(135deg, #8B1538 0%, #D4AF37 100%)' }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('qrGenerator.creating')}
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('qrGenerator.createQr')}
                                </span>
                            )}
                        </button>
                    </form>

                    {qrBase64 && (
                        <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2" style={{ borderColor: '#D4AF37' }}>
                            <h3 className="text-lg font-bold mb-4 text-center" style={{ color: '#1a1a1a' }}>{t('qrGenerator.qrReady')}</h3>
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-xl shadow-lg">
                                    <img
                                        src={qrBase64}
                                        alt="QR Kod"
                                        className="w-64 h-64"
                                    />
                                </div>
                                <a
                                    href={qrBase64}
                                    download="qr-code.png"
                                    className="mt-6 flex items-center space-x-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105"
                                    style={{ background: 'linear-gradient(135deg, #8B1538 0%, #D4AF37 100%)' }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>{t('common.download')}</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border" style={{ borderColor: '#e5e7eb' }}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #8B1538 100%)'
                            }}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
                                {t('qrHistory.title')}
                                <span className="ml-2 text-lg font-normal text-gray-500">({filteredQrCodes.length})</span>
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition duration-200"
                            style={{ color: '#374151' }}
                        >
                            <span>{showHistory ? t('qrHistory.hide') : t('qrHistory.show')}</span>
                            <svg
                                className={`w-5 h-5 transform transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {showHistory && filteredQrCodes.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={selectAllQrs}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border-2 transition duration-200 hover:shadow-md"
                                    style={{
                                        borderColor: selectedQrIds.length === filteredQrCodes.length ? '#8B1538' : '#e5e7eb',
                                        color: selectedQrIds.length === filteredQrCodes.length ? '#8B1538' : '#374151'
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">
                                        {selectedQrIds.length === filteredQrCodes.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                                    </span>
                                </button>

                                {selectedQrIds.length > 0 && (
                                    <div className="px-4 py-2 bg-white rounded-lg border-2" style={{ borderColor: '#D4AF37' }}>
                                        <span className="font-semibold" style={{ color: '#8B1538' }}>
                                            {selectedQrIds.length} QR seçildi
                                        </span>
                                    </div>
                                )}
                            </div>

                            {selectedQrIds.length > 0 && (
                                <button
                                    onClick={exportToPdf}
                                    disabled={isExporting}
                                    className="flex items-center space-x-2 px-6 py-2 text-white rounded-lg font-medium transition duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: 'linear-gradient(135deg, #8B1538 0%, #D4AF37 100%)' }}
                                >
                                    {isExporting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>PDF Hazırlanıyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>PDF Olarak İndir</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {showHistory && (
                        <div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                                        {t('qrHistory.searchLabel')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder={t('qrHistory.searchPlaceholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 transition duration-200"
                                            style={{ borderColor: '#e5e7eb', color: '#1a1a1a' }}
                                            onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        />
                                        <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                                            {t('qrHistory.dateFilter')}
                                        </label>
                                        <select
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 transition duration-200"
                                            style={{ borderColor: '#e5e7eb', color: '#1a1a1a' }}
                                        >
                                            <option value="all">{t('qrHistory.all')}</option>
                                            <option value="today">{t('qrHistory.today')}</option>
                                            <option value="week">{t('qrHistory.thisWeek')}</option>
                                            <option value="month">{t('qrHistory.thisMonth')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                                            {t('qrHistory.sortBy')}
                                        </label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 transition duration-200"
                                            style={{ borderColor: '#e5e7eb', color: '#1a1a1a' }}
                                        >
                                            <option value="newest">{t('qrHistory.newestFirst')}</option>
                                            <option value="oldest">{t('qrHistory.oldestFirst')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold" style={{ color: '#D4AF37' }}>{filteredQrCodes.length}</span> {t('qrHistory.found')}
                                    </p>
                                    {(searchTerm || dateFilter !== "all" || sortOrder !== "newest") && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setDateFilter("all");
                                                setSortOrder("newest");
                                            }}
                                            className="text-sm font-medium hover:underline transition duration-200"
                                            style={{ color: '#8B1538' }}
                                        >
                                            {t('qrHistory.clearFilters')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {filteredQrCodes.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-24 h-24 mx-auto mb-4" style={{ color: '#d1d5db' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-lg text-gray-500">
                                        {searchTerm || dateFilter !== "all"
                                            ? t('qrHistory.noResults')
                                            : t('qrHistory.noQr')}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredQrCodes.map((qr) => (
                                        <div
                                            key={qr.id}
                                            className="bg-white border rounded-xl p-4 hover:shadow-xl transition-all duration-200 group"
                                            style={{ borderColor: '#e5e7eb' }}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQrIds.includes(qr.id)}
                                                    onChange={() => toggleQrSelection(qr.id)}
                                                    className="w-5 h-5 rounded cursor-pointer"
                                                    style={{ accentColor: '#8B1538' }}
                                                />
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                                <img
                                                    src={`data:image/png;base64,${qr.qr_base64}`}
                                                    alt="QR Kod"
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                            <p className="text-sm font-medium mb-2 line-clamp-2 min-h-[2.5rem]" style={{ color: '#374151' }}>
                                                {qr.data}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(qr.created_at).toLocaleString('tr-TR')}
                                            </p>

                                            <div className="flex flex-col space-y-2">
                                                <div className="flex space-x-2">
                                                    <a
                                                        href={`data:image/png;base64,${qr.qr_base64}`}
                                                        download={`qr-${qr.id}.png`}
                                                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-white text-sm font-medium rounded-lg transition duration-200 hover:shadow-lg"
                                                        style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        <span>{t('common.download')}</span>
                                                    </a>
                                                    <button
                                                        onClick={() => shareWhatsApp(qr.data)}
                                                        className="flex items-center justify-center px-3 py-2 rounded-lg transition duration-200 hover:shadow-lg group"
                                                        style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: 'white' }}
                                                        title="WhatsApp'ta Paylaş"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(qr.id)}
                                                        className="flex items-center justify-center px-3 py-2 rounded-lg transition duration-200 hover:shadow-lg"
                                                        style={{ background: 'linear-gradient(135deg, #8B1538 0%, #DC2626 100%)', color: 'white' }}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main >
        </div >
    );
};

export default QrGenerator;