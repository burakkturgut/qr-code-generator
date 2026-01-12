import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import LanguageSwitcher from "../components/LanguageSwitcher";

const Register = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password || !confirmPassword) {
            setError(t('auth.fillAllFields'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('auth.passwordMismatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('auth.passwordTooShort'));
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register", {
                email,
                password,
            });

            navigate("/login", {
                state: { message: "Kayıt başarılı! Giriş yapabilirsiniz." }
            });
        } catch (err) {
            setError(err.response?.data?.msg || "Kayıt başarısız!");
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (!password) return null;
        if (password.length < 6) return { text: t('auth.weakPassword'), color: '#8B1538', width: '33%' };
        if (password.length < 8) return { text: t('auth.mediumPassword'), color: '#D4AF37', width: '66%' };
        return { text: t('auth.strongPassword'), color: '#10b981', width: '100%' };
    };

    const strength = getPasswordStrength();

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ backgroundColor: '#1a1a1a' }}>
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, #8B1538 0px, #8B1538 1px, transparent 1px, transparent 20px)`,
                }}></div>
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-20 right-20 w-96 h-96 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: '#8B1538' }}></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{ backgroundColor: '#D4AF37', animationDelay: '1s' }}></div>

            {/* Language Switcher */}
            <div className="absolute top-6 right-6 z-50">
                <div className="backdrop-blur-md bg-white/5 rounded-xl p-1 border shadow-2xl" style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                    <LanguageSwitcher />
                </div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl border overflow-hidden" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                    {/* Top Border */}
                    <div className="h-1" style={{ background: 'linear-gradient(90deg, #8B1538 0%, #D4AF37 50%, #8B1538 100%)' }}></div>

                    <div className="p-8">
                        {/* Logo Section */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl mb-4 shadow-lg transform hover:scale-110 transition-transform duration-500" style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #8B1538 100%)',
                                boxShadow: '0 10px 40px rgba(139, 21, 56, 0.3)'
                            }}>
                                <svg className="w-12 h-12" style={{ color: '#F5F5DC' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ color: '#F5F5DC' }}>
                                {t('auth.registerTitle')}
                            </h1>
                            <p className="text-sm font-medium" style={{ color: '#f4e4c1' }}>
                                {t('auth.registerSubtitle')}
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 backdrop-blur-md rounded-xl p-4 animate-shake border" style={{
                                backgroundColor: 'rgba(139, 21, 56, 0.2)',
                                borderColor: '#8B1538'
                            }}>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-3" style={{ color: '#D4AF37' }} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-sm" style={{ color: '#F5F5DC' }}>{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div className="relative group">
                                <div className={`absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500 ${emailFocused ? 'opacity-40' : ''}`} style={{ backgroundColor: '#D4AF37' }}></div>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        className="w-full px-4 py-4 bg-white/5 backdrop-blur-md border rounded-xl placeholder-transparent focus:outline-none transition-all duration-300 peer"
                                        style={{
                                            color: '#F5F5DC',
                                            borderColor: emailFocused ? '#D4AF37' : 'rgba(245, 245, 220, 0.2)'
                                        }}
                                        placeholder={t('auth.emailPlaceholder')}
                                        id="email"
                                    />
                                    <label
                                        htmlFor="email"
                                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${emailFocused || email
                                                ? '-top-6 text-xs font-semibold'
                                                : 'top-4 text-sm'
                                            }`}
                                        style={{ color: emailFocused ? '#D4AF37' : '#cbd5e1' }}
                                    >
                                        {t('auth.email')}
                                    </label>
                                    <div className="absolute right-4 top-4">
                                        <svg className={`w-5 h-5 transition-colors duration-300`} style={{ color: emailFocused ? '#D4AF37' : '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <div className={`absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500 ${passwordFocused ? 'opacity-40' : ''}`} style={{ backgroundColor: '#8B1538' }}></div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        className="w-full px-4 py-4 bg-white/5 backdrop-blur-md border rounded-xl placeholder-transparent focus:outline-none transition-all duration-300 peer pr-20"
                                        style={{
                                            color: '#F5F5DC',
                                            borderColor: passwordFocused ? '#8B1538' : 'rgba(245, 245, 220, 0.2)'
                                        }}
                                        placeholder={t('auth.passwordMinLength')}
                                        id="password"
                                    />
                                    <label
                                        htmlFor="password"
                                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${passwordFocused || password
                                                ? '-top-6 text-xs font-semibold'
                                                : 'top-4 text-sm'
                                            }`}
                                        style={{ color: passwordFocused ? '#8B1538' : '#cbd5e1' }}
                                    >
                                        {t('auth.password')}
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-12 top-4 focus:outline-none transition-transform duration-200 hover:scale-110"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" style={{ color: passwordFocused ? '#8B1538' : '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" style={{ color: passwordFocused ? '#8B1538' : '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>

                                    <div className="absolute right-4 top-4">
                                        <svg className={`w-5 h-5 transition-colors duration-300`} style={{ color: passwordFocused ? '#8B1538' : '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Password Strength Indicator */}
                            {strength && (
                                <div className="space-y-2">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                                        <div
                                            className="h-full transition-all duration-500 rounded-full"
                                            style={{
                                                width: strength.width,
                                                backgroundColor: strength.color,
                                                boxShadow: `0 0 10px ${strength.color}`
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs font-medium" style={{ color: strength.color }}>
                                        {strength.text}
                                    </p>
                                </div>
                            )}

                            {/* Confirm Password Input */}
                            <div className="relative group">
                                <div className={`absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500 ${confirmFocused ? 'opacity-40' : ''}`} style={{ backgroundColor: '#D4AF37' }}></div>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onFocus={() => setConfirmFocused(true)}
                                        onBlur={() => setConfirmFocused(false)}
                                        className="w-full px-4 py-4 bg-white/5 backdrop-blur-md border rounded-xl placeholder-transparent focus:outline-none transition-all duration-300 peer pr-20"
                                        style={{
                                            color: '#F5F5DC',
                                            borderColor: confirmFocused ? '#D4AF37' : 'rgba(245, 245, 220, 0.2)'
                                        }}
                                        placeholder={t('auth.confirmPassword')}
                                        id="confirmPassword"
                                    />
                                    <label
                                        htmlFor="confirmPassword"
                                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${confirmFocused || confirmPassword
                                                ? '-top-6 text-xs font-semibold'
                                                : 'top-4 text-sm'
                                            }`}
                                        style={{ color: confirmFocused ? '#D4AF37' : '#cbd5e1' }}
                                    >
                                        {t('auth.confirmPassword')}
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-12 top-4 focus:outline-none transition-transform duration-200 hover:scale-110"
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-5 h-5" style={{ color: confirmFocused ? '#D4AF37' : '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" style={{ color: confirmFocused ? '#D4AF37' : '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>

                                    <div className="absolute right-4 top-4">
                                        <svg className={`w-5 h-5 transition-colors duration-300`} style={{ color: confirmFocused ? '#D4AF37' : '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full group overflow-hidden"
                            >
                                <div className="absolute -inset-0.5 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-500" style={{ backgroundColor: '#8B1538' }}></div>
                                <div className="relative px-8 py-4 rounded-xl leading-none flex items-center justify-center transform transition-all duration-300 group-hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" style={{
                                    background: 'linear-gradient(135deg, #D4AF37 0%, #8B1538 100%)',
                                    boxShadow: '0 4px 20px rgba(139, 21, 56, 0.4)'
                                }}>
                                    {loading ? (
                                        <span className="flex items-center font-semibold" style={{ color: '#F5F5DC' }}>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t('auth.registering')}
                                        </span>
                                    ) : (
                                        <span className="font-semibold text-lg" style={{ color: '#F5F5DC' }}>
                                            {t('auth.register')}
                                        </span>
                                    )}
                                </div>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="mt-8 text-center">
                            <p className="text-sm" style={{ color: '#cbd5e1' }}>
                                {t('auth.alreadyHaveAccount')}{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold hover:underline transition duration-300"
                                    style={{ color: '#D4AF37' }}
                                >
                                    {t('auth.login')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Glow */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-8 blur-2xl rounded-full opacity-30" style={{ backgroundColor: '#8B1538' }}></div>
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s;
                }
            `}</style>
        </div>
    );
};

export default Register;