import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoutes';

const Login = lazy(() => import('./pages/login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analyst = lazy(() => import('./pages/Analyst'));
const PromptFirewall = lazy(() => import('./pages/PromptFirewall'));
const ThreatHunter = lazy(() => import('./pages/Threathunter'));
const IncidentResponse = lazy(() => import('./pages/IncidentResponse'));
const Copilot = lazy(() => import('./pages/Copilot'));
const VulnerabilityIntelligence = lazy(() => import('./pages/VulnerabilityIntelligence'));
const LiveAttackFeed = lazy(() => import('./pages/LiveAttackFeed'));
const TerminalConsole = lazy(() => import('./pages/TerminalConsole'));
const AttackSimulator = lazy(() => import('./pages/AttackSimulator'));
const PhishingDetector = lazy(() => import('./pages/PhishingDetector'));
const LogAnalyzer = lazy(() => import('./pages/logAnalyzer'));
const MalwareAnalyzer = lazy(() => import('./pages/MalwareAnalyzer'));
const ThreatMap = lazy(() => import('./pages/ThreatMap'));
const CommandCenter = lazy(() => import('./pages/CommandCentre'));
const VoiceAssistant = lazy(() => import('./pages/VoiceAssistant'));
const SocActivityFeed = lazy(() => import('./pages/SocActivityFeed'));
const IntegrityMonitor = lazy(() => import('./pages/IntegrityMonitor'));
const LockdownMode = lazy(() => import('./pages/LockdownMode'));
const ThreatPrediction = lazy(() => import('./pages/ThreatPrediction'));
const AIRecommendations = lazy(() => import('./pages/AIRecommendations'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#040814] text-white/70">
      Loading SentinelAI OS...
    </div>
  );
}

function RouteError() {
  const error = useRouteError();
  return (
    <div className="min-h-screen bg-[#040814] p-6 text-white">
      <div className="mx-auto mt-20 max-w-2xl rounded-xl border border-rose-500/30 bg-rose-500/10 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-200/70">Application error</p>
        <h1 className="mt-2 font-display text-3xl text-rose-100">This view hit an unexpected payload.</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{error?.message || 'Refresh the page and try the action again.'}</p>
        <button onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-cyan px-4 py-2 font-semibold text-black">
          Refresh
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const router = createBrowserRouter(
    [
      { path: '/login', element: <Login />, errorElement: <RouteError /> },
      { path: '/register', element: <Register />, errorElement: <RouteError /> },
      { path: '/', element: <ProtectedRoute><Dashboard /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/analyst', element: <ProtectedRoute><Analyst /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/prompt-firewall', element: <ProtectedRoute><PromptFirewall /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/vulnerability-intelligence', element: <ProtectedRoute><VulnerabilityIntelligence /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/live-attack-feed', element: <ProtectedRoute><LiveAttackFeed /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/attack-simulator', element: <ProtectedRoute><AttackSimulator /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/phishing-detector', element: <ProtectedRoute><PhishingDetector /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/log-analyzer', element: <ProtectedRoute><LogAnalyzer /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/malware-analyzer', element: <ProtectedRoute><MalwareAnalyzer /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/threat-map', element: <ProtectedRoute><ThreatMap /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/command-center', element: <ProtectedRoute><CommandCenter /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/voice-assistant', element: <ProtectedRoute><VoiceAssistant /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/soc-activity-feed', element: <ProtectedRoute><SocActivityFeed /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/integrity-monitor', element: <ProtectedRoute><IntegrityMonitor /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/lockdown-mode', element: <ProtectedRoute><LockdownMode /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/threat-prediction', element: <ProtectedRoute><ThreatPrediction /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/ai-recommendations', element: <ProtectedRoute><AIRecommendations /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/terminal-console', element: <ProtectedRoute><TerminalConsole /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/threat-hunter', element: <ProtectedRoute><ThreatHunter /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/incident-response', element: <ProtectedRoute><IncidentResponse /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '/copilot', element: <ProtectedRoute><Copilot /></ProtectedRoute>, errorElement: <RouteError /> },
      { path: '*', element: <Navigate to='/' replace />, errorElement: <RouteError /> },
    ],
    { future: { v7_startTransition: true, v7_relativeSplatPath: true } }
  );

  return (
    <AuthProvider>
      <Suspense fallback={<RouteFallback />}>
        <RouterProvider
          router={router}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        />
      </Suspense>
    </AuthProvider>
  );
}
