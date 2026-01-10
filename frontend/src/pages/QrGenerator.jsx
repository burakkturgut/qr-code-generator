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

    // QR Özelleştirme
    const [fgColor, setFgColor] = useState("#000000"); // Ön plan rengi (siyah)
    const [bgColor, setBgColor] = useState("#FFFFFF"); // Arka plan rengi (beyaz)
    const [qrSize, setQrSize] = useState(10); // Boyut
    const [myQrCodes, setMyQrCodes] = useState([]);
    const [showHistory, setShowHistory] = useState(true);

    // Filtreleme state'leri
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
    const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest

    const navigate = useNavigate();

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
                style: "square" // Sadece kare stil
            });

            setQrBase64(`data:image/png;base64,${response.data.qr_base64}`);
            setInputData("");
            loadMyQrCodes();
        } catch (err) {
            console.error(err);
            setError(t('qrGenerator.createError'));
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

    // Filtreleme fonksiyonu
    const getFilteredQrCodes = () => {
        let filtered = [...myQrCodes];

        // Arama filtresi
        if (searchTerm) {
            filtered = filtered.filter(qr =>
                qr.data.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Tarih filtresi
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

        // Sıralama
        if (sortOrder === "newest") {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return filtered;
    };

    const filteredQrCodes = getFilteredQrCodes();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.title')}</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <LanguageSwitcher />
                            <button
                                onClick={() => navigate("/settings")}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="hidden sm:inline">{t('common.settings')}</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 transform hover:scale-105"
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
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{t('dashboard.totalQr')}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{myQrCodes.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{t('dashboard.thisWeek')}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">
                                    {myQrCodes.filter(qr => {
                                        const date = new Date(qr.created_at);
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return date > weekAgo;
                                    }).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{t('dashboard.lastQr')}</p>
                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {myQrCodes.length > 0
                                        ? new Date(myQrCodes[0].created_at).toLocaleDateString('tr-TR')
                                        : t('dashboard.noQrYet')
                                    }
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Generator Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">{t('qrGenerator.createNew')}</h2>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('qrGenerator.textOrUrl')}
                            </label>
                            <input
                                type="text"
                                placeholder={t('qrGenerator.textPlaceholder')}
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                            />
                        </div>

                        {/* QR Özelleştirme Seçenekleri */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 space-y-4 border-2 border-purple-200">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                {t('qrGenerator.customization')}
                            </h3>

                            {/* Renk Seçiciler */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Ön Plan Rengi */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        🎨 QR Rengi
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            placeholder="#000000"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Arka Plan Rengi */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        🖼️ Arka Plan Rengi
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            placeholder="#FFFFFF"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Boyut */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📐 QR Boyutu: {qrSize}
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="15"
                                    value={qrSize}
                                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{t('qrGenerator.small')}</span>
                                    <span>{t('qrGenerator.medium')}</span>
                                    <span>{t('qrGenerator.large')}</span>
                                </div>
                            </div>

                            {/* Hızlı Renk Presetleri */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🌈 Hızlı Renkler
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { fg: "#000000", bg: "#FFFFFF", name: "Klasik" },
                                        { fg: "#1E40AF", bg: "#EFF6FF", name: "Mavi" },
                                        { fg: "#DC2626", bg: "#FEF2F2", name: "Kırmızı" },
                                        { fg: "#059669", bg: "#F0FDF4", name: "Yeşil" },
                                        { fg: "#7C3AED", bg: "#F5F3FF", name: "Mor" },
                                        { fg: "#EA580C", bg: "#FFF7ED", name: "Turuncu" },
                                    ].map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => {
                                                setFgColor(preset.fg);
                                                setBgColor(preset.bg);
                                            }}
                                            className="px-3 py-2 rounded-lg text-sm font-medium bg-white hover:shadow-md transition duration-200"
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
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('qrGenerator.qrReady')}</h3>
                            <div className="flex flex-col items-center">
                                <img
                                    src={qrBase64}
                                    alt="QR Kod"
                                    className="w-64 h-64 border-4 border-white rounded-xl shadow-xl"
                                />
                                <a
                                    href={qrBase64}
                                    download="qr-code.png"
                                    className="mt-6 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 transition duration-200 transform hover:scale-105"
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

                {/* QR History Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {t('qrHistory.title')}
                                <span className="ml-2 text-lg font-normal text-gray-500">({filteredQrCodes.length})</span>
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200"
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

                    {showHistory && (
                        <div>
                            {/* Filtreleme ve Arama Kontrolleri */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-4">
                                {/* Arama Kutusu */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('qrHistory.searchLabel')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder={t('qrHistory.searchPlaceholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                        />
                                        <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Tarih ve Sıralama Filtreleri */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Tarih Filtresi */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            {t('qrHistory.dateFilter')}
                                        </label>
                                        <select
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                        >
                                            <option value="all">{t('qrHistory.all')}</option>
                                            <option value="today">{t('qrHistory.today')}</option>
                                            <option value="week">{t('qrHistory.thisWeek')}</option>
                                            <option value="month">{t('qrHistory.thisMonth')}</option>
                                        </select>
                                    </div>

                                    {/* Sıralama */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            {t('qrHistory.sortBy')}
                                        </label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                        >
                                            <option value="newest">{t('qrHistory.newestFirst')}</option>
                                            <option value="oldest">{t('qrHistory.oldestFirst')}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Sonuç Sayısı ve Temizle Butonu */}
                                <div className="flex justify-between items-center pt-2">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-blue-600">{filteredQrCodes.length}</span> {t('qrHistory.found')}
                                    </p>
                                    {(searchTerm || dateFilter !== "all" || sortOrder !== "newest") && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setDateFilter("all");
                                                setSortOrder("newest");
                                            }}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                                        >
                                            {t('qrHistory.clearFilters')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* QR Listesi */}
                            {filteredQrCodes.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg">
                                        {searchTerm || dateFilter !== "all"
                                            ? t('qrHistory.noResults')
                                            : t('qrHistory.noQr')}
                                    </p>
                                    {(searchTerm || dateFilter !== "all") && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setDateFilter("all");
                                            }}
                                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Filtreleri temizle
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredQrCodes.map((qr) => (
                                        <div
                                            key={qr.id}
                                            className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                        >
                                            <div className="bg-white p-3 rounded-lg mb-3">
                                                <img
                                                    src={`data:image/png;base64,${qr.qr_base64}`}
                                                    alt="QR Kod"
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium mb-2 line-clamp-2 min-h-[2.5rem]">
                                                {qr.data}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(qr.created_at).toLocaleString('tr-TR')}
                                            </p>
                                            <div className="flex space-x-2">
                                                <a
                                                    href={`data:image/png;base64,${qr.qr_base64}`}
                                                    download={`qr-${qr.id}.png`}
                                                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    <span>{t('common.download')}</span>
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(qr.id)}
                                                    className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default QrGenerator;