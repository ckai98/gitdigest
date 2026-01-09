import { useState, useEffect } from 'react';
import RepoSelector from './components/RepoSelector';
import FilterPanel from './components/FilterPanel';
import ReportViewer from './components/ReportViewer';
import SettingsModal from './components/SettingsModal';
import CommitList from './components/CommitList';
import AIConfigPanel from './components/AIConfigPanel';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import CollapsiblePanel from './components/ui/CollapsiblePanel';
import { RepoInfo, Report, AppConfig, CommitSummary } from './types';
import { invoke } from '@tauri-apps/api/core';
import { Toaster, toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18nInstance from './i18n';

function AppContent() {
  const { t } = useTranslation();
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [commits, setCommits] = useState<CommitSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState<string>('zh');

  useEffect(() => {
    checkConfig();
    const handleOpenSettings = () => setShowSettings(true);
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);

  const checkConfig = async () => {
    try {
      const config = await invoke<AppConfig>('get_config');
      if (config.language && i18nInstance.changeLanguage) {
        i18nInstance.changeLanguage(config.language);
        setLanguage(config.language);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = async () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    try {
      const config = await invoke<AppConfig>('get_config');
      await invoke('save_config', { config: { ...config, language: newLang } });
      i18nInstance.changeLanguage(newLang);
      setLanguage(newLang);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (filters: { author: string; startDate: string; endDate: string }) => {
    if (!repoInfo) return;
    setLoading(true);
    setReport(null);
    try {
      const result = await invoke<CommitSummary[]>('collect_commits', {
        path: repoInfo.path,
        author: filters.author,
        startDate: filters.startDate,
        endDate: filters.endDate,
        maxCommits: 200,
      });

      setCommits(result);

      if (result.length === 0) {
        toast.error(t('toast.noCommits'));
      } else {
        toast.success(t('toast.foundCommits', { count: result.length }));
      }
    } catch (e) {
      console.error(e);
      toast.error(t('toast.error', { message: String(e) }));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (mode: 'simple' | 'detailed') => {
    if (commits.length === 0) return;
    setLoading(true);
    try {
      let commitsToProcess = [...commits];

      if (mode === 'detailed') {
        const hashes = commitsToProcess.slice(0, 50).map(c => c.hash);
        toast.loading("正在获取代码变更...", { id: 'fetching-diffs' });

        const diffsMap = await invoke<Record<string, string>>('get_commit_diffs', {
          path: repoInfo?.path,
          hashes
        });

        commitsToProcess = commitsToProcess.map(c => ({
          ...c,
          diff: diffsMap[c.hash]
        }));

        toast.dismiss('fetching-diffs');
      }

      const result = await invoke<Report>('generate_report', {
        commits: commitsToProcess
      });

      setReport(result);
      toast.success(t('toast.generated'));
    } catch (e) {
      console.error(e);
      toast.error(t('toast.error', { message: String(e) }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary transition-theme">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-gradient-glow absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent/30" />
        <div className="bg-gradient-glow absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/20" />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-card !bg-surface-secondary !text-content-primary',
          duration: 3000,
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConfigSatisfied={() => { }}
      />

      <div className="relative max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-cyan-600 flex items-center justify-center shadow-lg shadow-accent/25">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-content-primary">
                {t('app.title')}
              </h1>
              <p className="text-sm text-content-secondary">{t('app.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-lg bg-surface-tertiary hover:bg-surface-elevated border border-border hover:border-border-hover text-sm text-content-secondary hover:text-content-primary transition-all"
            >
              {language === 'zh' ? 'EN' : '中文'}
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-lg bg-surface-tertiary hover:bg-surface-elevated border border-border hover:border-border-hover flex items-center justify-center text-content-secondary hover:text-content-primary transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Repo Selector */}
            <RepoSelector
              repoInfo={repoInfo}
              onRepoChange={(info) => {
                setRepoInfo(info);
                setReport(null);
                setCommits([]);
              }}
            />

            {/* AI Config Panel */}
            <AIConfigPanel onConfigChange={() => { }} />

            {/* Filter Panel */}
            <FilterPanel
              repoInfo={repoInfo}
              onSearch={handleSearch}
              onGenerate={handleGenerateReport}
              loading={loading}
              hasCommits={commits.length > 0}
            />

            {/* Commit List */}
            {commits.length > 0 && (
              <CollapsiblePanel
                title={`提交记录 (${commits.length})`}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                defaultExpanded={true}
              >
                <CommitList commits={commits} />
              </CollapsiblePanel>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            {report ? (
              <ReportViewer report={report} />
            ) : (
              <div className="glass-card h-full min-h-[500px] flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-surface-tertiary flex items-center justify-center mb-6 animate-float">
                  <svg className="w-10 h-10 text-content-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xl font-medium text-content-secondary mb-2">
                  {t('report.placeholder.title')}
                </p>
                <p className="text-sm text-content-tertiary text-center max-w-md">
                  {t('report.placeholder.subtitle')}
                </p>

                {/* Quick Start Guide */}
                <div className="mt-8 flex gap-3">
                  <div className="flex items-center gap-2 text-xs text-content-tertiary">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium">1</span>
                    选择仓库
                  </div>
                  <svg className="w-4 h-4 text-content-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="flex items-center gap-2 text-xs text-content-tertiary">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium">2</span>
                    搜索提交
                  </div>
                  <svg className="w-4 h-4 text-content-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="flex items-center gap-2 text-xs text-content-tertiary">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium">3</span>
                    生成周报
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
