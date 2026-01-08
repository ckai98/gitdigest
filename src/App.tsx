import { useState, useEffect } from 'react';
import RepoSelector from './components/RepoSelector';
import FilterPanel from './components/FilterPanel';
import ReportViewer from './components/ReportViewer';
import SettingsModal from './components/SettingsModal';
import CommitList from './components/CommitList';
import { RepoInfo, Report, AppConfig, CommitSummary } from './types';
import { invoke } from '@tauri-apps/api/core';
import { Toaster, toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18nInstance from './i18n';

function App() {
  const { t } = useTranslation();
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [commits, setCommits] = useState<CommitSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
      }
      if (!config.api_key) {
        setTimeout(() => setShowSettings(true), 500);
      }
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

        // @ts-ignore
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <Toaster position="top-right" />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConfigSatisfied={() => { }}
      />

      <div className="max-w-6xl mx-auto p-6 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              {t('app.title')}
            </h1>
            <p className="text-slate-500 mt-1 text-lg">{t('app.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            ⚙️ {t('app.settings')}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <RepoSelector
              repoInfo={repoInfo}
              onRepoChange={(info) => {
                setRepoInfo(info);
                setReport(null);
              }}
            />

            <FilterPanel
              repoInfo={repoInfo}
              onSearch={handleSearch}
              onGenerate={handleGenerateReport}
              loading={loading}
              hasCommits={commits.length > 0}
            />

            {commits.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">
                  提交记录 ({commits.length})
                </h3>
                <CommitList commits={commits} />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            {report ? (
              <ReportViewer report={report} />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                <span className="text-6xl mb-4">📊</span>
                <p className="text-xl font-medium">{t('report.placeholder.title')}</p>
                <p className="text-sm">{t('report.placeholder.subtitle')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
