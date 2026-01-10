import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
                onClick={() => changeLanguage('tr')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition duration-200 ${i18n.language === 'tr'
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
            >
                🇹🇷 TR
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition duration-200 ${i18n.language === 'en'
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
            >
                🇬🇧 EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;