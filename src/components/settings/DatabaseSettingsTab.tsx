import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useCrm } from '../../context/CrmContext';
import {
  Database,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
  FileCode,
  ShieldCheck,
  Zap,
  Lock,
  ExternalLink,
} from 'lucide-react';

export const DatabaseSettingsTab: React.FC = () => {
  const { addToast } = useCrm();

  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Form config
  const [host, setHost] = useState('');
  const [port, setPort] = useState(3306);
  const [database, setDatabase] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  // Operations state
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await api.getDatabaseStatus();
      setDbStatus(data);
      if (data?.config) {
        if (data.config.host) setHost(data.config.host);
        if (data.config.port) setPort(data.config.port);
        if (data.config.database) setDatabase(data.config.database);
        if (data.config.user) setUser(data.config.user);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host || !database || !user) {
      addToast({
        title: 'Champs requis',
        message: 'Veuillez renseigner au minimum l’hôte, le nom de base de données et l’utilisateur.',
        type: 'error',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await api.testDatabaseConnection({
        host,
        port: Number(port) || 3306,
        user,
        password,
        database,
      });

      if (res.success) {
        setTestResult({
          success: true,
          message: 'Connexion MySQL réussie ! Le serveur distant Hostinger répond parfaitement.',
        });
        addToast({
          title: 'Test de connexion réussi',
          message: 'Le serveur MySQL distant est joignable et authentifié.',
          type: 'success',
        });
      } else {
        setTestResult({
          success: false,
          message: res.message || 'Impossible de joindre le serveur MySQL avec ces identifiants.',
        });
        addToast({
          title: 'Échec de connexion MySQL',
          message: res.message || 'Vérifiez l’hôte, le port, le nom de base et les accès.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erreur réseau lors du test de connexion MySQL.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleApplyConnection = async () => {
    setIsConnecting(true);
    try {
      const res = await api.connectDatabase({
        host,
        port: Number(port) || 3306,
        user,
        password,
        database,
      });

      if (res.success) {
        addToast({
          title: 'Connexion MySQL activée',
          message: 'La base de données principale est désormais connectée à MySQL.',
          type: 'success',
        });
        fetchStatus();
      } else {
        addToast({
          title: 'Erreur d’activation',
          message: res.message || 'La connexion n’a pas pu être établie.',
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Erreur',
        message: err.message || 'Erreur lors de la configuration de la base MySQL.',
        type: 'error',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRunMigration = async () => {
    setIsMigrating(true);
    try {
      const res = await api.runDatabaseMigration();
      if (res.success) {
        addToast({
          title: 'Tables synchronisées',
          message: 'Toutes les tables (véhicules, achats, ventes, factures, utilisateurs) ont été créées.',
          type: 'success',
        });
        fetchStatus();
      } else {
        addToast({
          title: 'Erreur de migration',
          message: res.message || 'Une erreur est survenue lors de l’exécution du schéma.',
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Erreur de migration',
        message: err.message || 'Erreur lors de la migration MySQL.',
        type: 'error',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDownloadSqlSchema = () => {
    window.open('/api/database/sql-schema', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Current DB Status Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0C0E13] border border-[#232733] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232733] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                État de la Base de Données
              </h2>
              <p className="text-xs text-[#85878A]">
                Moteur de persistance, tables relationnelles et synchronisation MySQL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchStatus}
            disabled={isLoadingStatus}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[#14161E] border border-[#262A36] text-xs font-semibold text-[#85878A] hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#12141A] border border-[#242834]">
            <span className="text-[11px] text-[#85878A] block">Type de stockage</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-white">
                {dbStatus?.isMySql ? 'MySQL Distant (Hostinger)' : 'Serveur Node / Fallback Actif'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#12141A] border border-[#242834]">
            <span className="text-[11px] text-[#85878A] block">Statut de connexion</span>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {dbStatus?.connected ? 'Connecté & Opérationnel' : 'Prêt pour connexion'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#12141A] border border-[#242834]">
            <span className="text-[11px] text-[#85878A] block">Base ciblée</span>
            <span className="text-sm font-bold text-white font-mono mt-1 block truncate">
              {dbStatus?.config?.database || 'univers_auto_crm'}
            </span>
          </div>
        </div>

        {/* Quick notice */}
        <div className="p-3.5 rounded-xl bg-[#12141B] border border-[#262A38] text-xs text-[#85878A] leading-relaxed flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Architecture Découplée et Haute Disponibilité :</strong>{' '}
            L'application est conçue pour fonctionner directement avec votre base MySQL Hostinger.
            Même si la base de données distante est en maintenance temporaire, le serveur assure la
            continuité de service avec sauvegarde sur disque sécurisée.
          </div>
        </div>
      </div>

      {/* Hostinger MySQL Connection Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0C0E13] border border-[#232733] space-y-5">
        <div className="border-b border-[#232733] pb-4">
          <h3 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-[#E50914]" />
            <span>Paramètres de Connexion MySQL (Hostinger / cPanel)</span>
          </h3>
          <p className="text-xs text-[#85878A] mt-1">
            Indiquez les accès fournis dans votre tableau de bord Hostinger (Bases de données MySQL).
          </p>
        </div>

        <form onSubmit={handleTestConnection} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#85878A] mb-1">
                Hôte MySQL (Host)
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="Ex : srv123.main-hosting.eu ou localhost"
                className="w-full px-3.5 py-2 rounded-xl bg-[#14161E] border border-[#262A36] text-xs sm:text-sm text-white placeholder-[#525765] focus:border-[#E50914] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1">Port</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                placeholder="3306"
                className="w-full px-3.5 py-2 rounded-xl bg-[#14161E] border border-[#262A36] text-xs sm:text-sm text-white placeholder-[#525765] focus:border-[#E50914] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1">
                Nom de la base de données
              </label>
              <input
                type="text"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                placeholder="u123456_universauto"
                className="w-full px-3.5 py-2 rounded-xl bg-[#14161E] border border-[#262A36] text-xs sm:text-sm text-white placeholder-[#525765] focus:border-[#E50914] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1">
                Utilisateur MySQL (User)
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="u123456_admin"
                className="w-full px-3.5 py-2 rounded-xl bg-[#14161E] border border-[#262A36] text-xs sm:text-sm text-white placeholder-[#525765] focus:border-[#E50914] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1">
                Mot de passe MySQL
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-[#14161E] border border-[#262A36] text-xs sm:text-sm text-white placeholder-[#525765] focus:border-[#E50914] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Test result feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isTesting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1A1D26] hover:bg-[#222634] border border-[#2D3242] rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Tester la connexion</span>
              </button>

              <button
                type="button"
                onClick={handleApplyConnection}
                disabled={isConnecting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#B8000A] rounded-xl shadow-lg shadow-[#E50914]/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enregistrer & Connecter</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunMigration}
              disabled={isMigrating}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#14161E] hover:bg-[#1E212B] border border-[#2B2F3D] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Exécuter les tables SQL (Migrations)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Hostinger phpMyAdmin Manual Setup & Script Download */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0C0E13] border border-[#232733] space-y-4">
        <div className="flex items-center justify-between border-b border-[#232733] pb-3">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-[#E50914]" />
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">
                Schéma SQL Officiel pour Hostinger / phpMyAdmin
              </h3>
              <p className="text-xs text-[#85878A]">
                Importez directement ce script SQL dans votre phpMyAdmin pour créer instantanément
                toutes les tables relationnelles avec les index et clés étrangères.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSqlSchema}
            className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#B8000A] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger univers_auto_schema.sql</span>
          </button>
        </div>

        {/* Steps for Hostinger */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#12141A] border border-[#242834]">
            <span className="w-5 h-5 rounded-full bg-[#E50914] text-white font-bold flex items-center justify-center text-[10px] mb-2">
              1
            </span>
            <h4 className="font-bold text-white mb-1">Créer la base MySQL</h4>
            <p className="text-[#85878A] text-[11px] leading-relaxed">
              Dans cPanel Hostinger &gt; <em>Bases de données MySQL</em>, créez une base et un
              utilisateur associé avec tous les privilèges.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#12141A] border border-[#242834]">
            <span className="w-5 h-5 rounded-full bg-[#E50914] text-white font-bold flex items-center justify-center text-[10px] mb-2">
              2
            </span>
            <h4 className="font-bold text-white mb-1">Importer le script SQL</h4>
            <p className="text-[#85878A] text-[11px] leading-relaxed">
              Ouvrez <em>phpMyAdmin</em>, sélectionnez votre base, allez dans l'onglet{' '}
              <strong>Importer</strong> et chargez le fichier{' '}
              <code>univers_auto_schema.sql</code>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#12141A] border border-[#242834]">
            <span className="w-5 h-5 rounded-full bg-[#E50914] text-white font-bold flex items-center justify-center text-[10px] mb-2">
              3
            </span>
            <h4 className="font-bold text-white mb-1">Connecter l'application</h4>
            <p className="text-[#85878A] text-[11px] leading-relaxed">
              Saisissez les identifiants ci-dessus et cliquez sur{' '}
              <strong>Enregistrer &amp; Connecter</strong>. Toutes les données réelles sont
              immédiatement enregistrées en base distante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
