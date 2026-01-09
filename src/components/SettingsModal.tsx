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
        model: 'gpt-4',
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
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="glass-card p-6 w-full max-w-md mx-4 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-content-primary">
                            {t('settings.title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-surface-tertiary flex items-center justify-center text-content-tertiary hover:text-content-primary transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1.5">
                            {t('settings.language')}
                        </label>
                        <select
                            value={config.language}
                            onChange={(e) => setConfig({ ...config, language: e.target.value })}
                            className="select-field"
                        >
                            <option value="zh">中文</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1.5">
                            {t('settings.provider')}
                        </label>
                        <select
                            value={config.provider}
                            onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                            className="select-field"
                        >
                            <option value="openai">OpenAI</option>
                            <option value="deepseek">DeepSeek</option>
                            <option value="custom">Custom (OpenAI Compatible)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1.5">
                            {t('settings.baseUrl')}
                        </label>
                        <input
                            type="text"
                            value={config.base_url}
                            onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1.5">
                            {t('settings.apiKey')}
                        </label>
                        <input
                            type="password"
                            value={config.api_key || ''}
                            onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                            placeholder="sk-..."
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1.5">
                            {t('settings.model')}
                        </label>
                        <input
                            type="text"
                            value={config.model}
                            onChange={(e) => setConfig({ ...config, model: e.target.value })}
                            placeholder="gpt-4 / deepseek-chat"
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        {t('settings.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary flex-1"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('settings.saving')}
                            </span>
                        ) : (
                            t('settings.save')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
