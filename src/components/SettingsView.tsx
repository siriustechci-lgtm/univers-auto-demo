import React, { useState, useRef } from 'react';
import { useCrm } from '../context/CrmContext';
import { useAuth } from '../context/AuthContext';
import { User, UserRole, BackupLog, NotificationSettings } from '../types';
import { EmptyState } from './EmptyState';
import { BANESERVICES_LOGO_DATA_URI, COMPANY_NAME_OFFICIAL } from '../assets/logo';
import { BaneServicesLogo } from './common/BaneServicesLogo';
import {
  Settings,
  Building2,
  Users,
  Shield,
  FileText,
  Bell,
  HardDrive,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Globe,
  DollarSign,
  Calendar,
  Clock,
  Smartphone,
  Mail,
  MessageSquare,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  LogOut,
  Laptop,
  Database,
} from 'lucide-react';

import { RolesPermissionsMatrix } from './users/RolesPermissionsMatrix';
import { DatabaseSettingsTab } from './settings/DatabaseSettingsTab';

type SettingsTab =
  | 'general'
  | 'company'
  | 'database'
  | 'users'
  | 'roles'
  | 'billing'
  | 'notifications'
  | 'backups'
  | 'security'
  | 'profile';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    resetAllData,
    addToast,
    vehicles,
    clients,
    sales,
    rentals,
    payments,
  } = useCrm();

  const {
    currentUser,
    users,
    companyProfile,
    updateUserProfile,
    changeUserPassword,
    logoutOtherDevices,
    updateCompanyProfile,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
  } = useAuth();

  // Active settings section
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // ================= 1. PARAMÈTRES GÉNÉRAUX =================
  const [language, setLanguage] = useState(settings.language || 'Français');
  const [currency, setCurrency] = useState(settings.currency || 'FCFA');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || 'FCFA');
  const [timeZone, setTimeZone] = useState(settings.timeZone || 'Africa/Dakar (GMT)');
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState(settings.timeFormat || '24h');

  // ================= 2. ENTREPRISE =================
  const [companyName, setCompanyName] = useState(
    companyProfile.name && companyProfile.name !== 'Sirius Auto' && companyProfile.name !== 'BANESERVICES AUTO'
      ? companyProfile.name
      : 'UNIVERS AUTO'
  );
  const [logoUrl, setLogoUrl] = useState(companyProfile.logoUrl || BANESERVICES_LOGO_DATA_URI);
  const [companyPhone, setCompanyPhone] = useState(companyProfile.phone || settings.phone || '+221 33 800 00 00');
  const [companyWhatsapp, setCompanyWhatsapp] = useState(companyProfile.whatsapp || settings.whatsapp || '+221 77 000 00 00');
  const [companyEmail, setCompanyEmail] = useState(companyProfile.email || settings.email || 'contact@universauto.sn');
  const [companyWebsite, setCompanyWebsite] = useState(companyProfile.website || settings.website || 'https://universauto.sn');
  // Adresse
  const [country, setCountry] = useState(companyProfile.country || settings.country || 'Sénégal');
  const [city, setCity] = useState(companyProfile.city || settings.city || 'Dakar');
  const [address, setAddress] = useState(companyProfile.address || settings.address || 'Boulevard du Centenaire de la Commune de Dakar');
  const [postalCode, setPostalCode] = useState(settings.postalCode || '10000');
  // Mentions Légales
  const [rccm, setRccm] = useState(companyProfile.rccm || settings.rccm || 'SN.DKR.2024.B.1234');
  const [taxNumber, setTaxNumber] = useState(companyProfile.taxNumber || settings.taxNumber || '0098765432Y');
  const [legalInfo, setLegalInfo] = useState(companyProfile.legalInfo || settings.legalInfo || 'Achat & Vente de Véhicules Neufs et d’Occasion');
  const [stampUrl, setStampUrl] = useState(companyProfile.stampUrl || '');
  const [signatureUrl, setSignatureUrl] = useState(companyProfile.signatureUrl || '');

  // ================= 3. UTILISATEURS =================
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormUsername, setUserFormUsername] = useState('');
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPhone, setUserFormPhone] = useState('');
  const [userFormRole, setUserFormRole] = useState<UserRole>('Commercial');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormStatus, setUserFormStatus] = useState(true);

  // ================= 4. FACTURATION =================
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix || 'FAC-');
  const [receiptPrefix, setReceiptPrefix] = useState(settings.receiptPrefix || 'REC-');
  const [autoNumbering, setAutoNumbering] = useState(settings.autoNumbering !== false);
  const [billingCurrency, setBillingCurrency] = useState(settings.currency || 'FCFA');
  const [billingCurrencySymbol, setBillingCurrencySymbol] = useState(settings.currencySymbol || 'FCFA');
  const [taxEnabled, setTaxEnabled] = useState(settings.taxEnabled !== false);
  const [defaultVatRate, setDefaultVatRate] = useState<number>(settings.defaultVatRate || 0);
  const [invoiceFooter, setInvoiceFooter] = useState(settings.invoiceFooter || 'UNIVERS AUTO — Votre partenaire de confiance pour l’automobile neuve et d’occasion.');
  const [rentalTerms, setRentalTerms] = useState(settings.rentalTerms || '');

  // ================= 5. NOTIFICATIONS =================
  const [notifications, setNotifications] = useState<NotificationSettings>(
    settings.notifications || {
      systemNotifications: true,
      paymentNotifications: true,
      rentalNotifications: true,
      saleNotifications: true,
      channelApp: true,
      channelWhatsapp: false,
      channelEmail: true,
    }
  );

  // ================= 6. SAUVEGARDES =================
  const [backupHistory, setBackupHistory] = useState<BackupLog[]>(settings.backupHistory || []);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // ================= 7. SÉCURITÉ =================
  const [secCurrentPassword, setSecCurrentPassword] = useState('');
  const [secNewPassword, setSecNewPassword] = useState('');
  const [secConfirmPassword, setSecConfirmPassword] = useState('');
  const [showSecCurrentPass, setShowSecCurrentPass] = useState(false);
  const [showSecNewPass, setShowSecNewPass] = useState(false);

  // ================= 8. PROFIL PERSONNEL =================
  const [profFullName, setProfFullName] = useState(currentUser?.fullName || '');
  const [profPhone, setProfPhone] = useState(currentUser?.phone || '');
  const [profEmail, setProfEmail] = useState(currentUser?.email || '');
  const [profAvatar, setProfAvatar] = useState(currentUser?.avatarUrl || '');

  // Currency options
  const currenciesList = [
    { code: 'EUR', symbol: '€', label: 'Euro (EUR — €)' },
    { code: 'USD', symbol: '$', label: 'Dollar US (USD — $)' },
    { code: 'XOF', symbol: 'FCFA', label: 'Franc CFA BCEAO (XOF — FCFA)' },
    { code: 'XAF', symbol: 'FCFA', label: 'Franc CFA BEAC (XAF — FCFA)' },
    { code: 'MAD', symbol: 'MAD', label: 'Dirham Marocain (MAD)' },
    { code: 'CAD', symbol: 'CAD$', label: 'Dollar Canadien (CAD$)' },
    { code: 'CHF', symbol: 'CHF', label: 'Franc Suisse (CHF)' },
    { code: 'GBP', symbol: '£', label: 'Livre Sterling (GBP — £)' },
    { code: 'GNF', symbol: 'GNF', label: 'Franc Guinéen (GNF)' },
    { code: 'CDF', symbol: 'CDF', label: 'Franc Congolais (CDF)' },
  ];

  // Save General Settings
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      language,
      currency,
      currencySymbol,
      timeZone,
      dateFormat,
      timeFormat,
    });
    updateCompanyProfile({
      language,
      currency,
      currencySymbol,
      timeZone,
      dateFormat,
      timeFormat,
    });
    addToast({
      title: 'Paramètres généraux enregistrés',
      message: 'Les réglages de langue, devise et formats ont été appliqués immédiatement.',
      type: 'success',
    });
  };

  // Save Company Settings
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      name: companyName,
      logoUrl,
      phone: companyPhone,
      whatsapp: companyWhatsapp,
      email: companyEmail,
      website: companyWebsite,
      country,
      city,
      address,
      rccm,
      taxNumber,
      legalInfo,
      stampUrl,
      signatureUrl,
    };
    updateCompanyProfile(updated);
    updateSettings({
      companyName,
      phone: companyPhone,
      whatsapp: companyWhatsapp,
      email: companyEmail,
      website: companyWebsite,
      country,
      city,
      address,
      postalCode,
      rccm,
      siretOrTaxId: rccm || taxNumber,
      taxNumber,
      legalInfo,
      legalStatus: legalInfo,
    });
    addToast({
      title: 'Entreprise mise à jour',
      message: 'Les informations légales et coordonnées de l\'agence sont synchronisées.',
      type: 'success',
    });
  };

  // Save Billing Settings
  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      invoicePrefix,
      receiptPrefix,
      autoNumbering,
      currency: billingCurrency,
      currencySymbol: billingCurrencySymbol,
      taxEnabled,
      defaultVatRate: Number(defaultVatRate) || 0,
      invoiceFooter,
      rentalTerms,
    });
    updateCompanyProfile({
      currency: billingCurrency,
      currencySymbol: billingCurrencySymbol,
    });
    addToast({
      title: 'Paramètres de facturation enregistrés',
      message: 'Les préfixes, taxes et mentions de factures ont été mis à jour.',
      type: 'success',
    });
  };

  // Save Notification Settings
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      notifications,
    });
    addToast({
      title: 'Notifications mises à jour',
      message: 'Vos préférences de canaux et alertes sont actives.',
      type: 'success',
    });
  };

  // User Management
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserFormUsername('');
    setUserFormName('');
    setUserFormEmail('');
    setUserFormPhone('');
    setUserFormRole('Commercial');
    setUserFormPassword('Sirius2026!');
    setUserFormStatus(true);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUserId(user.id);
    setUserFormUsername(user.username || user.email.split('@')[0] || '');
    setUserFormName(user.fullName);
    setUserFormEmail(user.email);
    setUserFormPhone(user.phone || '');
    setUserFormRole(user.role);
    setUserFormStatus(user.isActive !== false);
    setUserFormPassword('');
    setIsUserModalOpen(true);
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormName.trim()) {
      addToast({
        title: 'Nom obligatoire',
        message: 'Veuillez renseigner le nom complet de l\'utilisateur.',
        type: 'error',
      });
      return;
    }

    const finalUsername = (userFormUsername.trim() || (userFormEmail ? userFormEmail.split('@')[0] : '') || userFormName.toLowerCase().replace(/\s+/g, '.')).toLowerCase();
    const finalEmail = userFormEmail.trim() ? userFormEmail.trim().toLowerCase() : '';

    if (editingUserId) {
      updateUser(
        editingUserId,
        {
          fullName: userFormName.trim(),
          username: finalUsername,
          email: finalEmail,
          phone: userFormPhone.trim(),
          role: userFormRole,
          isActive: userFormStatus,
        },
        userFormPassword.trim() ? userFormPassword.trim() : undefined
      );
      addToast({
        title: 'Utilisateur mis à jour',
        message: `Les informations de ${userFormName} (@${finalUsername}) ont été modifiées avec succès.`,
        type: 'success',
      });
    } else {
      const finalPassword = userFormPassword.trim();
      if (!finalPassword) {
        addToast({
          title: 'Mot de passe requis',
          message: 'Veuillez définir un mot de passe pour ce nouvel utilisateur.',
          type: 'error',
        });
        return;
      }
      if (finalPassword.length < 4) {
        addToast({
          title: 'Mot de passe trop court',
          message: 'Le mot de passe doit comporter au moins 4 caractères.',
          type: 'error',
        });
        return;
      }
      addUser(
        {
          fullName: userFormName.trim(),
          username: finalUsername,
          email: finalEmail,
          phone: userFormPhone.trim(),
          role: userFormRole,
          isActive: userFormStatus,
        },
        finalPassword
      );
      addToast({
        title: 'Nouvel utilisateur créé',
        message: `${userFormName} (@${finalUsername}) a été ajouté avec le rôle ${userFormRole}.`,
        type: 'success',
      });
    }

    setIsUserModalOpen(false);
  };

  // Manual Backup trigger
  const handleCreateBackup = () => {
    exportDataJSON();
    const totalRecords = vehicles.length + clients.length + sales.length + rentals.length + payments.length;
    const newLog: BackupLog = {
      id: 'bck_' + Date.now(),
      timestamp: new Date().toISOString(),
      sizeKb: Math.max(1, Math.round(totalRecords * 0.45)),
      itemCount: totalRecords,
      type: 'manual',
      status: 'Succès',
    };
    const updatedHistory = [newLog, ...backupHistory].slice(0, 10);
    setBackupHistory(updatedHistory);
    updateSettings({
      backupHistory: updatedHistory,
      lastBackupDate: newLog.timestamp,
    });
  };

  // Restore backup from JSON
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          const success = importDataJSON(event.target.result);
          if (success) {
            const newLog: BackupLog = {
              id: 'rst_' + Date.now(),
              timestamp: new Date().toISOString(),
              sizeKb: Math.round(event.target.result.length / 1024),
              itemCount: 0,
              type: 'restoration',
              status: 'Succès',
            };
            const updatedHistory = [newLog, ...backupHistory].slice(0, 10);
            setBackupHistory(updatedHistory);
            updateSettings({ backupHistory: updatedHistory });
          }
        }
      };
    }
  };

  // Change Password Security
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (secNewPassword.length < 6) {
      addToast({
        title: 'Mot de passe trop court',
        message: 'Le nouveau mot de passe doit comporter au moins 6 caractères.',
        type: 'error',
      });
      return;
    }
    if (secNewPassword !== secConfirmPassword) {
      addToast({
        title: 'Erreur de confirmation',
        message: 'Les nouveaux mots de passe ne correspondent pas.',
        type: 'error',
      });
      return;
    }

    const res = changeUserPassword(secCurrentPassword, secNewPassword);
    if (res.success) {
      addToast({
        title: 'Sécurité mise à jour',
        message: 'Votre mot de passe a été modifié avec succès.',
        type: 'success',
      });
      setSecCurrentPassword('');
      setSecNewPassword('');
      setSecConfirmPassword('');
    } else {
      addToast({
        title: 'Échec du changement',
        message: res.message || 'Mot de passe actuel incorrect.',
        type: 'error',
      });
    }
  };

  // Save User Personal Profile
  const handleSavePersonalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profFullName.trim() || !profEmail.trim()) {
      addToast({
        title: 'Champs obligatoires',
        message: 'Le nom complet et l\'adresse e-mail sont obligatoires.',
        type: 'error',
      });
      return;
    }
    updateUserProfile({
      fullName: profFullName.trim(),
      phone: profPhone.trim(),
      email: profEmail.trim().toLowerCase(),
      avatarUrl: profAvatar.trim(),
    });
    addToast({
      title: 'Profil personnel mis à jour',
      message: 'Vos coordonnées ont été enregistrées immédiatement.',
      type: 'success',
    });
  };

  // Navigation Items definitions
  const tabsList = [
    { id: 'general', label: 'Paramètres généraux', icon: Settings },
    { id: 'company', label: 'Entreprise & Coordonnées', icon: Building2 },
    { id: 'database', label: 'Base de données MySQL', icon: Database },
    { id: 'users', label: 'Utilisateurs et accès', icon: Users, badge: users.length },
    { id: 'roles', label: 'Rôles & permissions', icon: Shield },
    { id: 'billing', label: 'Facturation & Taxes', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backups', label: 'Sauvegardes', icon: HardDrive },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'profile', label: 'Mon Profil', icon: UserIcon },
  ];

  return (
    <div id="settings-view" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A18] tracking-tight font-['Outfit']">
          Paramètres & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-[#7A7A72]">
          Centralisez la personnalisation de votre agence, de votre équipe et de vos règles opérationnelles
        </p>
      </div>

      {/* Main Settings Layout with Sidebar / Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E5E5DF] p-2 sm:p-3 shadow-xs space-y-1">
          {tabsList.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                id={`settings-tab-${t.id}`}
                onClick={() => setActiveTab(t.id as SettingsTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#5A5A40] text-white shadow-xs'
                    : 'text-[#5A5A52] hover:text-[#1A1A18] hover:bg-[#FAFAF8]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#7A7A72]'}`} />
                  <span>{t.label}</span>
                </div>
                {t.badge !== undefined && t.badge > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#F0F0EB] text-[#5A5A40]'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Container */}
        <div className="lg:col-span-9 space-y-6">
          {/* ================= 1. PARAMÈTRES GÉNÉRAUX ================= */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E5E5DF] pb-4">
                <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#5A5A40]" />
                  <span>Paramètres Généraux</span>
                </h2>
                <p className="text-xs text-[#7A7A72]">
                  Définissez la langue par défaut, la devise de travail et les formats d'affichage
                </p>
              </div>

              <form onSubmit={handleSaveGeneral} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Langue */}
                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">Langue de l'application</label>
                    <select
                      id="gen-lang"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-medium"
                    >
                      <option value="Français">Français (FR)</option>
                      <option value="English">English (EN)</option>
                      <option value="Español">Español (ES)</option>
                      <option value="العربية">العربية (AR)</option>
                    </select>
                  </div>

                  {/* Devise */}
                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">Devise principale</label>
                    <select
                      id="gen-curr"
                      value={currency}
                      onChange={(e) => {
                        const selected = currenciesList.find((c) => c.code === e.target.value);
                        setCurrency(e.target.value);
                        if (selected) setCurrencySymbol(selected.symbol);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-medium"
                    >
                      {currenciesList.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fuseau horaire */}
                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">Fuseau horaire</label>
                    <select
                      id="gen-tz"
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-medium"
                    >
                      <option value="Europe/Paris (UTC+1)">Europe/Paris (UTC+1)</option>
                      <option value="Africa/Abidjan (UTC+0)">Afrique de l'Ouest / Abidjan, Dakar (UTC+0)</option>
                      <option value="Africa/Douala (UTC+1)">Afrique Centrale / Douala, Libreville (UTC+1)</option>
                      <option value="Africa/Casablanca (UTC+1)">Afrique du Nord / Casablanca (UTC+1)</option>
                      <option value="America/Montreal (UTC-5)">Amérique / Montréal, New York (UTC-5)</option>
                      <option value="UTC">UTC Standard</option>
                    </select>
                  </div>

                  {/* Format de Date */}
                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">Format de date</label>
                    <select
                      id="gen-df"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-medium"
                    >
                      <option value="DD/MM/YYYY">JJ/MM/AAAA (ex : 17/08/2026)</option>
                      <option value="YYYY-MM-DD">AAAA-MM-JJ (ex : 2026-08-17)</option>
                      <option value="MM/DD/YYYY">MM/JJ/AAAA (ex : 08/17/2026)</option>
                    </select>
                  </div>

                  {/* Format d'Heure */}
                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">Format d'heure</label>
                    <select
                      id="gen-tf"
                      value={timeFormat}
                      onChange={(e) => setTimeFormat(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-medium"
                    >
                      <option value="24h">24 heures (ex : 14:30)</option>
                      <option value="12h">12 heures AM/PM (ex : 02:30 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E5DF] flex justify-end">
                  <button
                    id="save-general-btn"
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les modifications</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= 2. ENTREPRISE ================= */}
          {activeTab === 'company' && (
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E5E5DF] pb-4">
                <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#5A5A40]" />
                  <span>Entreprise & Identité Commerciale</span>
                </h2>
                <p className="text-xs text-[#7A7A72]">
                  Informations légales et coordonnées qui apparaîtront sur tous vos contrats et factures
                </p>
              </div>

              <form onSubmit={handleSaveCompany} className="space-y-6">
                {/* 1. Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    1. Coordonnées & Image de marque
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Nom de l'entreprise / Agence *
                      </label>
                      <input
                        id="comp-name-input"
                        type="text"
                        placeholder="Ex : Sirius Auto Motors"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    {/* Logo Section */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#2D2D2A]">
                          Logo Officiel de l'Entreprise
                        </label>
                        <span className="text-[11px] text-[#7A7A72]">
                          Apparaît sur vos documents, factures et en-têtes
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Logo Preview */}
                        <div className="w-40 h-24 p-2 bg-white rounded-xl border border-[#E5E5DF] shadow-2xs flex items-center justify-center shrink-0">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt="Logo Entreprise"
                              referrerPolicy="no-referrer"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <BaneServicesLogo variant="full" className="w-full h-full" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              htmlFor="comp-logo-file-input"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] hover:border-[#5A5A40] text-xs font-semibold text-[#1A1A18] hover:bg-[#F5F5F0] transition-colors cursor-pointer shadow-2xs"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#5A5A40]" />
                              <span>Importer un nouveau logo (Image)</span>
                            </label>
                            <input
                              id="comp-logo-file-input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setLogoUrl(event.target.result as string);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => setLogoUrl(BANESERVICES_LOGO_DATA_URI)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] hover:border-[#00509E] text-xs font-medium text-[#00509E] hover:bg-[#00509E]/5 transition-colors cursor-pointer shadow-2xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Rétablir logo officiel BANESERVICES AUTO</span>
                            </button>
                          </div>

                          <div>
                            <input
                              id="comp-logo-input"
                              type="text"
                              placeholder="Ou renseignez une URL / Data URI du logo..."
                              value={logoUrl}
                              onChange={(e) => setLogoUrl(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Numéro de Téléphone *
                      </label>
                      <input
                        id="comp-phone-input"
                        type="tel"
                        placeholder="+33 1 23 45 67 89 / +225 07..."
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Numéro WhatsApp Pro
                      </label>
                      <input
                        id="comp-whatsapp-input"
                        type="tel"
                        placeholder="+33 6... / +225 05..."
                        value={companyWhatsapp}
                        onChange={(e) => setCompanyWhatsapp(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Adresse Email professionnelle *
                      </label>
                      <input
                        id="comp-email-input"
                        type="email"
                        placeholder="contact@agence.com"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Site Web
                      </label>
                      <input
                        id="comp-web-input"
                        type="url"
                        placeholder="https://www.siriusauto.com"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Adresse */}
                <div className="space-y-4 pt-4 border-t border-[#E5E5DF]">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    2. Adresse Géographique
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">Pays</label>
                      <input
                        id="comp-country-input"
                        type="text"
                        placeholder="France, Côte d'Ivoire, Maroc, Sénégal..."
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">Ville</label>
                      <input
                        id="comp-city-input"
                        type="text"
                        placeholder="Paris, Abidjan, Casablanca..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">Code postal / Boîte postale</label>
                      <input
                        id="comp-zip-input"
                        type="text"
                        placeholder="75008, BP 123..."
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Adresse complète / Boulevard / Rue
                      </label>
                      <input
                        id="comp-addr-input"
                        type="text"
                        placeholder="12 Avenue des Concessions, Quartier Automobile"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Informations légales */}
                <div className="space-y-4 pt-4 border-t border-[#E5E5DF]">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    3. Informations Légales & Fiscales
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        RCCM / Registre du Commerce (ou SIRET)
                      </label>
                      <input
                        id="comp-rccm-input"
                        type="text"
                        placeholder="CI-ABJ-2026-B-12345 / 849 123 456 00012"
                        value={rccm}
                        onChange={(e) => setRccm(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Numéro Fiscal / NIF / Numéro TVA
                      </label>
                      <input
                        id="comp-taxnum-input"
                        type="text"
                        placeholder="NIF 2026-987654 / FR 12 345678901"
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Autres mentions légales (Forme juridique, Capital, etc.)
                      </label>
                      <input
                        id="comp-legal-input"
                        type="text"
                        placeholder="SAS au capital de 50 000 € / SARL unipersonnelle"
                        value={legalInfo}
                        onChange={(e) => setLegalInfo(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E5DF] flex justify-end">
                  <button
                    id="save-company-btn"
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B8000A] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer l'Entreprise</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= BASE DE DONNÉES MYSQL ================= */}
          {activeTab === 'database' && <DatabaseSettingsTab />}

          {/* ================= 3. UTILISATEURS ================= */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5DF] pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#5A5A40]" />
                    <span>Gestion des Utilisateurs</span>
                  </h2>
                  <p className="text-xs text-[#7A7A72]">
                    Ajoutez, modifiez ou désactivez les accès des membres de votre équipe
                  </p>
                </div>

                <button
                  id="add-user-top-btn"
                  onClick={handleOpenAddUser}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un utilisateur</span>
                </button>
              </div>

              {users.length === 0 ? (
                <EmptyState
                  id="empty-state-users"
                  icon={<Users className="w-8 h-8 text-[#5A5A40]" />}
                  title="Aucun utilisateur enregistré"
                  description="Créez des accès pour vos collaborateurs avec des rôles sur mesure (Gestionnaire, Commercial, Caissier)."
                  actionText="Ajouter un utilisateur"
                  onAction={handleOpenAddUser}
                />
              ) : (
                <div className="rounded-2xl border border-[#E5E5DF] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase tracking-wider font-semibold border-b border-[#E5E5DF]">
                        <tr>
                          <th className="px-4 py-3">Utilisateur & Nom</th>
                          <th className="px-4 py-3">Rôle</th>
                          <th className="px-4 py-3 text-center">Statut</th>
                          <th className="px-4 py-3">Dernière connexion</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5DF]">
                        {users.map((u) => {
                          const isActive = u.isActive !== false;
                          const isSelf = currentUser?.id === u.id;
                          const displayUsername = u.username || (u.email ? u.email.split('@')[0] : 'directeur');

                          return (
                            <tr key={u.id} className="hover:bg-[#F9F9F6] transition-colors">
                              {/* Nom & Utilisateur */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                    {u.fullName.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-[#1A1A18]">
                                        {u.fullName}
                                      </span>
                                      {isSelf && (
                                        <span className="text-[10px] text-[#5A5A40] font-semibold bg-[#5A5A40]/10 px-1.5 py-0.5 rounded-md">
                                          (Vous)
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#7A7A72]">
                                      <span className="font-mono text-[#5A5A40]">@{displayUsername}</span>
                                      <span>•</span>
                                      <span>{u.email}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Rôle */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] uppercase tracking-wider ${
                                    u.role === 'Directeur' || u.role === 'Administrateur'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : u.role === 'Gestionnaire'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : u.role === 'Caissier'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : u.role === 'Comptable'
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                      : u.role === 'Agent'
                                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>

                              {/* Statut */}
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                                    isActive
                                      ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border border-[#4A7A4A]/20'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {isActive ? 'Actif' : 'Désactivé'}
                                </span>
                              </td>

                              {/* Dernière connexion */}
                              <td className="px-4 py-3 text-[#7A7A72] text-[11px] whitespace-nowrap">
                                {u.lastLogin
                                  ? new Date(u.lastLogin).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Jamais connecté'}
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Modifier */}
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    className="p-1.5 rounded-lg text-[#5A5A40] hover:bg-[#5A5A40]/10 transition-colors cursor-pointer"
                                    title="Modifier l'utilisateur"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  {/* Activer / Désactiver */}
                                  {!isSelf && (
                                    <button
                                      onClick={() => toggleUserStatus(u.id)}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                        isActive
                                          ? 'text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50'
                                          : 'text-[#4A7A4A] hover:bg-[#4A7A4A]/10'
                                      }`}
                                    >
                                      {isActive ? 'Désactiver' : 'Activer'}
                                    </button>
                                  )}

                                  {/* Supprimer */}
                                  {!isSelf && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Supprimer définitivement l'utilisateur ${u.fullName} ?`)) {
                                          deleteUser(u.id);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 4. RÔLES ET PERMISSIONS ================= */}
          {activeTab === 'roles' && (
            <RolesPermissionsMatrix />
          )}

          {/* ================= 5. FACTURATION ================= */}
          {activeTab === 'billing' && (
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E5E5DF] pb-4">
                <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#5A5A40]" />
                  <span>Paramètres de Facturation & Documents</span>
                </h2>
                <p className="text-xs text-[#7A7A72]">
                  Configurez la numérotation automatique, les préfixes, la taxe TVA et les conditions contractuelles
                </p>
              </div>

              <form onSubmit={handleSaveBilling} className="space-y-6">
                {/* Prefixes & Auto-numbering */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    Numérotation & Séquences
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Préfixe des Factures de Vente / Location
                      </label>
                      <input
                        id="bill-inv-prefix"
                        type="text"
                        value={invoicePrefix}
                        onChange={(e) => setInvoicePrefix(e.target.value)}
                        placeholder="FAC-"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm font-mono text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Préfixe des Reçus de Paiement
                      </label>
                      <input
                        id="bill-rec-prefix"
                        type="text"
                        value={receiptPrefix}
                        onChange={(e) => setReceiptPrefix(e.target.value)}
                        placeholder="REC-"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm font-mono text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] cursor-pointer">
                        <input
                          id="bill-autonum-chk"
                          type="checkbox"
                          checked={autoNumbering}
                          onChange={(e) => setAutoNumbering(e.target.checked)}
                          className="w-4 h-4 text-[#5A5A40] rounded-sm focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#1A1A18] block">
                            Numérotation automatique séquentielle
                          </span>
                          <span className="text-[11px] text-[#7A7A72]">
                            Génère automatiquement les numéros chronologiques uniques pour chaque vente, contrat et reçu.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Devise & Taxes */}
                <div className="space-y-4 pt-4 border-t border-[#E5E5DF]">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    Devise & Régime Fiscal (TVA)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">Devise utilisée pour la facturation</label>
                      <select
                        id="bill-curr-sel"
                        value={billingCurrency}
                        onChange={(e) => {
                          const item = currenciesList.find((c) => c.code === e.target.value);
                          setBillingCurrency(e.target.value);
                          if (item) setBillingCurrencySymbol(item.symbol);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-medium"
                      >
                        {currenciesList.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                        Taux de TVA par défaut (%)
                      </label>
                      <input
                        id="bill-vat-rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={defaultVatRate}
                        onChange={(e) => setDefaultVatRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm font-mono text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Mentions & Conditions */}
                <div className="space-y-4 pt-4 border-t border-[#E5E5DF]">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    Conditions Générales & Pied de page
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                      Conditions générales des contrats de location
                    </label>
                    <textarea
                      id="bill-terms-txt"
                      rows={3}
                      value={rentalTerms}
                      onChange={(e) => setRentalTerms(e.target.value)}
                      placeholder="Le locataire s'engage à restituer le véhicule dans le même état..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                      Pied de page légal des factures & reçus
                    </label>
                    <input
                      id="bill-footer-txt"
                      type="text"
                      value={invoiceFooter}
                      onChange={(e) => setInvoiceFooter(e.target.value)}
                      placeholder="Règlement par chèque ou virement accepté. Pénalités de retard applicables..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E5DF] flex justify-end">
                  <button
                    id="save-billing-btn"
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer la Facturation</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= 6. NOTIFICATIONS ================= */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E5E5DF] pb-4">
                <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#5A5A40]" />
                  <span>Gestion des Notifications & Alertes</span>
                </h2>
                <p className="text-xs text-[#7A7A72]">
                  Sélectionnez les événements déclencheurs et vos canaux de diffusion préférés
                </p>
              </div>

              <form onSubmit={handleSaveNotifications} className="space-y-6">
                {/* 1. Types de notifications */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    Événements Déclencheurs
                  </h3>

                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] hover:bg-[#F5F5F0] transition-colors cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-[#1A1A18] block">Notifications Système</span>
                        <span className="text-[11px] text-[#7A7A72]">Mises à jour, alertes de sécurité et rappels techniques</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.systemNotifications}
                        onChange={(e) =>
                          setNotifications({ ...notifications, systemNotifications: e.target.checked })
                        }
                        className="w-4 h-4 text-[#5A5A40] rounded-sm cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] hover:bg-[#F5F5F0] transition-colors cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-[#1A1A18] block">Notifications Paiements & Cautions</span>
                        <span className="text-[11px] text-[#7A7A72]">Alertes d'encaissements, dépôts de garantie et remboursements</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.paymentNotifications}
                        onChange={(e) =>
                          setNotifications({ ...notifications, paymentNotifications: e.target.checked })
                        }
                        className="w-4 h-4 text-[#5A5A40] rounded-sm cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] hover:bg-[#F5F5F0] transition-colors cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-[#1A1A18] block">Notifications Locations</span>
                        <span className="text-[11px] text-[#7A7A72]">Rappels de retours de véhicules, échéances de contrats et retards</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.rentalNotifications}
                        onChange={(e) =>
                          setNotifications({ ...notifications, rentalNotifications: e.target.checked })
                        }
                        className="w-4 h-4 text-[#5A5A40] rounded-sm cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] hover:bg-[#F5F5F0] transition-colors cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-[#1A1A18] block">Notifications Ventes</span>
                        <span className="text-[11px] text-[#7A7A72]">Confirmation de vente conclue et factures soldées</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.saleNotifications}
                        onChange={(e) =>
                          setNotifications({ ...notifications, saleNotifications: e.target.checked })
                        }
                        className="w-4 h-4 text-[#5A5A40] rounded-sm cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Canaux de diffusion */}
                <div className="space-y-3 pt-4 border-t border-[#E5E5DF]">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    Canaux de Réception
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.channelApp}
                        onChange={(e) => setNotifications({ ...notifications, channelApp: e.target.checked })}
                        className="w-4 h-4 text-[#5A5A40] rounded-sm cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#5A5A40]" />
                        <span className="text-xs font-bold text-[#1A1A18]">Application (Toasts)</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.channelWhatsapp}
                        onChange={(e) =>
                          setNotifications({ ...notifications, channelWhatsapp: e.target.checked })
                        }
                        className="w-4 h-4 text-[#5A5A40] rounded-sm cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-[#1A1A18]">WhatsApp</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.channelEmail}
                        onChange={(e) => setNotifications({ ...notifications, channelEmail: e.target.checked })}
                        className="w-4 h-4 text-[#5A5A40] rounded-sm cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-[#1A1A18]">Email</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E5DF] flex justify-end">
                  <button
                    id="save-notif-btn"
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les Préférences</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= 7. SAUVEGARDES ================= */}
          {activeTab === 'backups' && (
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E5E5DF] pb-4">
                <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-[#5A5A40]" />
                  <span>Sauvegardes & Restauration des Données</span>
                </h2>
                <p className="text-xs text-[#7A7A72]">
                  Exportez l'intégralité de votre base de données locale ou restaurez une sauvegarde précédente
                </p>
              </div>

              {/* Status & Actions */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#7A7A72] uppercase tracking-wider block">
                    Dernière Sauvegarde Manuelle
                  </span>
                  <span className="text-sm font-bold text-[#1A1A18] font-mono">
                    {settings.lastBackupDate
                      ? new Date(settings.lastBackupDate).toLocaleString('fr-FR')
                      : 'Aucune sauvegarde enregistrée'}
                  </span>
                  <span className="text-[11px] text-[#7A7A72] block mt-0.5">
                    {vehicles.length} véhicules, {clients.length} clients, {sales.length} ventes, {rentals.length} locations
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Bouton Sauvegarder & Télécharger */}
                  <button
                    id="manual-backup-btn"
                    onClick={handleCreateBackup}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Sauvegarde manuelle</span>
                  </button>

                  {/* Bouton Restaurer */}
                  <label
                    htmlFor="restore-file-input"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F5F0] text-[#1A1A18] font-semibold text-xs sm:text-sm border border-[#E5E5DF] transition-all cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4 text-[#5A5A40]" />
                    <span>Restaurer</span>
                    <input
                      id="restore-file-input"
                      type="file"
                      accept=".json"
                      onChange={handleRestoreBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Historique des Sauvegardes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Historique des Sauvegardes Récentes
                </h3>

                {backupHistory.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-[#E5E5DF] text-xs text-[#7A7A72]">
                    Aucun historique de sauvegarde. Cliquez sur "Sauvegarde manuelle" pour générer un instantané.
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#E5E5DF] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFAF8] text-[#7A7A72] font-semibold border-b border-[#E5E5DF]">
                        <tr>
                          <th className="px-4 py-2.5">Horodatage</th>
                          <th className="px-4 py-2.5">Type</th>
                          <th className="px-4 py-2.5">Taille estimée</th>
                          <th className="px-4 py-2.5 text-center">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5DF]">
                        {backupHistory.map((b) => (
                          <tr key={b.id} className="hover:bg-[#F9F9F6]">
                            <td className="px-4 py-2.5 font-mono font-medium text-[#1A1A18]">
                              {new Date(b.timestamp).toLocaleString('fr-FR')}
                            </td>
                            <td className="px-4 py-2.5 capitalize text-[#5A5A52]">
                              {b.type === 'manual' ? 'Sauvegarde manuelle' : b.type === 'restoration' ? 'Restauration fichier' : 'Automatique'}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-[#7A7A72]">
                              {b.sizeKb} Ko
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-[#4A7A4A]/10 text-[#4A7A4A] font-bold text-[10px]">
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Zone Dangereuse */}
              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Zone de Danger : Remise à Zéro</span>
                </div>
                <p className="text-xs text-rose-700">
                  Cette action supprimera irréversiblement tous les véhicules, clients, ventes, locations et paiements pour réinitialiser le CRM en état vierge.
                </p>

                {isResetConfirmOpen ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        resetAllData();
                        setIsResetConfirmOpen(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Confirmer la suppression totale
                    </button>
                    <button
                      onClick={() => setIsResetConfirmOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser toutes les données</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ================= 8. SÉCURITÉ ================= */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E5E5DF] pb-4">
                <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#5A5A40]" />
                  <span>Sécurité & Gestion des Sessions</span>
                </h2>
                <p className="text-xs text-[#7A7A72]">
                  Modifiez votre mot de passe et sécurisez vos sessions actives
                </p>
              </div>

              {/* Changement de mot de passe */}
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Changement de Mot de Passe
                </h3>

                <div>
                  <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      id="sec-curr-pass"
                      type={showSecCurrentPass ? 'text' : 'password'}
                      value={secCurrentPassword}
                      onChange={(e) => setSecCurrentPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 pr-10 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecCurrentPass(!showSecCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A92] hover:text-[#1A1A18]"
                    >
                      {showSecCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                    Nouveau mot de passe (min. 6 caractères)
                  </label>
                  <div className="relative">
                    <input
                      id="sec-new-pass"
                      type={showSecNewPass ? 'text' : 'password'}
                      value={secNewPassword}
                      onChange={(e) => setSecNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-3.5 py-2 pr-10 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecNewPass(!showSecNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A92] hover:text-[#1A1A18]"
                    >
                      {showSecNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="sec-conf-pass"
                    type="password"
                    value={secConfirmPassword}
                    onChange={(e) => setSecConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <button
                  id="submit-change-pass"
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Mettre à jour le mot de passe</span>
                </button>
              </form>

              {/* Sessions actives */}
              <div className="space-y-4 pt-4 border-t border-[#E5E5DF]">
                <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Gestion des Sessions Actives
                </h3>

                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1A1A18] block">
                        Navigateur Actuel (Session Active)
                      </span>
                      <span className="text-[11px] text-[#7A7A72]">
                        Dernière activité : À l'instant • Authentifié
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logoutOtherDevices();
                      addToast({
                        title: 'Sessions distantes fermées',
                        message: 'Toutes les autres connexions ont été déconnectées.',
                        type: 'info',
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] hover:bg-[#F5F5F0] text-[#1A1A18] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Déconnecter les autres appareils</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. PROFIL UTILISATEUR ================= */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E5E5DF] pb-4">
                <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[#5A5A40]" />
                  <span>Mon Profil Personnel</span>
                </h2>
                <p className="text-xs text-[#7A7A72]">
                  Gérez vos informations de compte, coordonnées et photo de profil
                </p>
              </div>

              <form onSubmit={handleSavePersonalProfile} className="space-y-5 max-w-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center font-bold text-2xl uppercase border border-[#5A5A40]/20 shrink-0">
                    {profFullName ? profFullName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A18] text-sm font-['Outfit']">
                      {profFullName || 'Utilisateur'}
                    </h3>
                    <span className="text-xs text-[#5A5A40] font-semibold block">
                      Rôle : {currentUser?.role || 'Administrateur'}
                    </span>
                    <span className="text-[11px] text-[#7A7A72]">
                      Compte rattaché à {companyName || 'Sirius Auto CRM'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                      Nom complet *
                    </label>
                    <input
                      id="prof-name-input"
                      type="text"
                      value={profFullName}
                      onChange={(e) => setProfFullName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                      Numéro de téléphone
                    </label>
                    <input
                      id="prof-phone-input"
                      type="tel"
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                      Adresse Email *
                    </label>
                    <input
                      id="prof-email-input"
                      type="email"
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                      URL de la photo de profil (Avatar)
                    </label>
                    <input
                      id="prof-avatar-input"
                      type="url"
                      placeholder="https://..."
                      value={profAvatar}
                      onChange={(e) => setProfAvatar(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    id="save-profile-btn"
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer mon Profil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className="text-xs font-semibold text-[#5A5A40] hover:underline cursor-pointer"
                  >
                    Modifier le mot de passe →
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* MODALE D'AJOUT / MODIFICATION D'UTILISATEUR */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3">
              <h3 className="font-bold text-base text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#5A5A40]" />
                <span>{editingUserId ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</span>
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserForm} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Marc Dubois"
                  value={userFormName}
                  onChange={(e) => {
                    setUserFormName(e.target.value);
                    if (!editingUserId && !userFormUsername) {
                      setUserFormUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                    Nom d'utilisateur (Identifiant) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : mdubois"
                    value={userFormUsername}
                    onChange={(e) => setUserFormUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                    {editingUserId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe initial *'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUserId ? 'Laisser vide pour conserver' : 'Ex : Sirius2026!'}
                    value={userFormPassword}
                    onChange={(e) => setUserFormPassword(e.target.value)}
                    required={!editingUserId}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    placeholder="m.dubois@agence.com"
                    value={userFormEmail}
                    onChange={(e) => setUserFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={userFormPhone}
                    onChange={(e) => setUserFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                    Rôle & Droits d'accès
                  </label>
                  <select
                    value={userFormRole}
                    onChange={(e) => setUserFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-medium"
                  >
                    <option value="Directeur">Directeur (Accès complet & administration)</option>
                    <option value="Gestionnaire">Gestionnaire (Parc, Ventes, Locations, Clients)</option>
                    <option value="Commercial">Commercial (Clients, Prospects, Ventes, Devis)</option>
                    <option value="Caissier">Caissier (Paiements, Reçus, Encaissements)</option>
                    <option value="Comptable">Comptable (Finances, Dépenses, Revenus, Rapports)</option>
                    <option value="Agent">Agent (Opérations terrain, Réceptions véhicules)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D2D2A] mb-1.5">
                    Statut du compte
                  </label>
                  <select
                    value={userFormStatus ? 'active' : 'inactive'}
                    onChange={(e) => setUserFormStatus(e.target.value === 'active')}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden font-medium"
                  >
                    <option value="active">Actif (Peut se connecter)</option>
                    <option value="inactive">Désactivé (Accès bloqué)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs font-semibold text-[#7A7A72] hover:bg-[#F5F5F0] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  {editingUserId ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
