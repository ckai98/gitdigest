import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AppConfig } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import CollapsiblePanel from './ui/CollapsiblePanel';

interface Props {
    onConfigChange?: () => void;
}

export default function AIConfigPanel({ onConfigChange }: Props) {
    const { t } = useTranslation();
    const [config, setConfig] = useState<AppConfig>({
        api_key: '',
        provider: 'openai',
        base_url: 'https://api.openai.com/v1',
        model: 'gpt-4',
        language: 'zh'
    });
    const [isConfigured, setIsConfigured] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        loadConfig();
        const interval = setInterval(checkConfigStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const loadConfig = async () => {
        try {
            const savedConfig = await invoke<AppConfig>('get_config');
            setConfig({
                ...savedConfig,
                api_key: savedConfig.api_key || '',
            });
            setIsConfigured(!!savedConfig.api_key && savedConfig.api_key.length > 0);
        } catch (e) {
            console.error('Failed to load config', e);
        }
    };

    const checkConfigStatus = async () => {
        try {
            const savedConfig = await invoke<AppConfig>('get_config');
            setIsConfigured(!!savedConfig.api_key && savedConfig.api_key.length > 0);
        } catch {
            setIsConfigured(false);
        }
    };

    const handleSave = async () => {
        if (!config.api_key?.trim()) {
            toast.error(t('settings.required'));
            return;
        }

        setSaving(true);
        try {
            await invoke('save_config', { config });
            toast.success(t('settings.saved'));
            setIsConfigured(true);
            onConfigChange?.();
        } catch (e) {
            console.error('Failed to save config', e);
            toast.error('保存失败: ' + String(e));
        } finally {
            setSaving(false);
        }
    };

    const statusBadge = (
        <span className={`badge ${isConfigured ? 'badge-success' : 'badge-error'}`}>
            <span className={`status-dot mr-1.5 ${isConfigured ? 'success' : 'error'}`} />
            {isConfigured ? '已连接' : '未配置'}
        </span>
    );

    return (
        <CollapsiblePanel
            title="AI 配置"
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            }
            badge={statusBadge}
            defaultExpanded={!isConfigured}
        >
            <div className="space-y-3">
                {/* Provider Select */}
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-1">
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

                {/* Model */}
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-1">
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

                {/* API Key */}
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-1">
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

                {/* Advanced Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-content-tertiary hover:text-accent flex items-center gap-1 transition-colors"
                >
                    <svg
                        className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    高级设置
                </button>

                {/* Advanced Options */}
                {showAdvanced && (
                    <div className="animate-fade-in">
                        <label className="block text-xs font-medium text-content-secondary mb-1">
                            {t('settings.baseUrl')}
                        </label>
                        <input
                            type="text"
                            value={config.base_url}
                            onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                            className="input-field"
                        />
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full text-sm py-2"
                >
                    {saving ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            保存中...
                        </span>
                    ) : (
                        '保存配置'
                    )}
                </button>
            </div>
        </CollapsiblePanel>
    );
}
