import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AppConfig } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18nInstance from '../i18n';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfigSatisfied: () => void;
}

export default function SettingsModal({ isOpen, onClose, onConfigSatisfied }: Props) {
    const { t } = useTranslation();
    const [config, setConfig] = useState<AppConfig>({
        api_key: '',
        provider: 'openai',
        base_url: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
        language: 'zh'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadConfig();
        }
    }, [isOpen]);

    const loadConfig = async () => {
        try {
            const savedConfig = await invoke<AppConfig>('get_config');
            const loadedLanguage = savedConfig.language || 'zh';

            setConfig({
                ...savedConfig,
                api_key: savedConfig.api_key || '',
                language: loadedLanguage
            });
            // Sync frontend i18n
            if (i18nInstance.changeLanguage) {
                i18nInstance.changeLanguage(loadedLanguage);
            }
        } catch (e) {
            console.error('Failed to load config', e);
            toast.error('Failed to load settings');
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Basic validation
            if (!config.api_key?.trim()) {
                toast.error(t('settings.required'));
                setLoading(false);
                return;
            }

            await invoke('save_config', { config });
            // Apply language change immediately
            if (i18nInstance.changeLanguage) {
                i18nInstance.changeLanguage(config.language);
            }

            toast.success(t('settings.saved'));
            onConfigSatisfied();
            onClose();
        } catch (e) {
            console.error('Failed to save config', e);
            toast.error('Failed to save settings: ' + String(e));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    ⚙️ {t('settings.title')}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.language')}</label>
                        <select
                            value={config.language}
                            onChange={(e) => setConfig({ ...config, language: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        >
                            <option value="zh">中文</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.provider')}</label>
                        <select
                            value={config.provider}
                            onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        >
                            <option value="openai">OpenAI</option>
                            <option value="deepseek">DeepSeek</option>
                            <option value="custom">Custom (OpenAI Compatible)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.baseUrl')}</label>
                        <input
                            type="text"
                            value={config.base_url}
                            onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.apiKey')}</label>
                        <input
                            type="password"
                            value={config.api_key || ''}
                            onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                            placeholder="sk-..."
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.model')}</label>
                        <input
                            type="text"
                            value={config.model}
                            onChange={(e) => setConfig({ ...config, model: e.target.value })}
                            placeholder="gpt-4 / deepseek-chat"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {t('settings.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? t('settings.saving') : t('settings.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
