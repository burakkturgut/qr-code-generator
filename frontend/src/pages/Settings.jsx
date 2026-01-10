import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const Settings = () => {
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Email değiştirme
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [emailSuccess, setEmailSuccess] = useState("");

    // Şifre değiştirme
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Hesap silme
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await api.get("/auth/profile");
            setProfile(response.data);
        } catch (err) {
            console.error("Profil yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setEmailError("");
        setEmailSuccess("");

        if (!newEmail || !emailPassword) {
            setEmailError(t('auth.fillAllFields'));
            return;
        }

        setEmailLoading(true);

        try {
            const response = await api.put("/auth/change-email", {
                new_email: newEmail,
                password: emailPassword
            });

            setEmailSuccess(response.data.msg);
            setNewEmail("");
            setEmailPassword("");
            loadProfile();
        } catch (err) {
            setEmailError(err.response?.data?.msg || "Email değiştirilemedi");
        } finally {
            setEmailLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError(t('auth.fillAllFields'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(t('auth.passwordMismatch'));
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError(t('auth.passwordTooShort'));
            return;
        }

        setPasswordLoading(true);

        try {
            const response = await api.put("/auth/change-password", {
                current_password: currentPassword,
                new_password: newPassword
            });

            setPasswordSuccess(response.data.msg);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setPasswordError(err.response?.data?.msg || "Şifre değiştirilemedi");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            alert("Şifre gerekli!");
            return;
        }

        setDeleteLoading(true);

        try {
            await api.delete("/auth/delete-account", {
                data: { password: deletePassword }
            });

            alert("Hesabınız silindi. Güle güle!");
            localStorage.removeItem("access_token");
            navigate("/login");
        } catch (err) {
            alert(err.response?.data?.msg || "Hesap silinemedi");
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate("/qr")}
                                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition duration-200"
                            >
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <LanguageSwitcher />
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Profil Bilgileri */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                                {profile?.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{t('settings.profileInfo')}</h2>
                            <p className="text-gray-500">{t('settings.accountDetails')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">{t('settings.email')}</p>
                            <p className="text-lg font-semibold text-gray-800">{profile?.email}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">{t('settings.totalQrCodes')}</p>
                            <p className="text-lg font-semibold text-gray-800">{profile?.total_qr_codes}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                            <p className="text-sm text-gray-500 mb-1">{t('settings.memberSince')}</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {new Date(profile?.created_at).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email Değiştirme */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('settings.changeEmail')}</h2>

                    {emailSuccess && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">
                            {emailSuccess}
                        </div>
                    )}

                    {emailError && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
                            {emailError}
                        </div>
                    )}

                    <form onSubmit={handleEmailChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('settings.newEmail')}</label>
                            <input
                                type="email"
                                placeholder="yeni@email.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('settings.currentPassword')}</label>
                            <input
                                type="password"
                                placeholder={t('settings.enterPassword')}
                                value={emailPassword}
                                onChange={(e) => setEmailPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={emailLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200 disabled:opacity-50"
                        >
                            {emailLoading ? t('settings.changing') : t('settings.changeEmail')}
                        </button>
                    </form>
                </div>

                {/* Şifre Değiştirme */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('settings.changePassword')}</h2>

                    {passwordSuccess && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">
                            {passwordSuccess}
                        </div>
                    )}

                    {passwordError && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
                            {passwordError}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('settings.currentPassword')}</label>
                            <input
                                type="password"
                                placeholder={t('settings.currentPassword')}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('settings.newPassword')}</label>
                            <input
                                type="password"
                                placeholder={t('auth.passwordMinLength')}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('settings.confirmNewPassword')}</label>
                            <input
                                type="password"
                                placeholder={t('settings.newPasswordPlaceholder')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-blue-700 transition duration-200 disabled:opacity-50"
                        >
                            {passwordLoading ? t('settings.changing') : t('settings.changePassword')}
                        </button>
                    </form>
                </div>

                {/* Hesap Silme */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
                    <h2 className="text-xl font-bold text-red-600 mb-4">{t('settings.dangerZone')}</h2>
                    <p className="text-gray-600 mb-4">
                        {t('settings.deleteAccountWarning')}
                    </p>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200"
                        >
                            {t('settings.deleteAccount')}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                <p className="text-red-700 font-semibold">{t('settings.areYouSure')}</p>
                                <p className="text-red-600 text-sm mt-1">{t('settings.cannotUndo')}</p>
                            </div>
                            <input
                                type="password"
                                placeholder={t('settings.confirmWithPassword')}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 outline-none"
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
                                >
                                    {deleteLoading ? t('settings.deleting') : t('settings.yesDelete')}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeletePassword("");
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Settings;