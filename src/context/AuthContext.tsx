import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  CompanyProfile,
  AuthScreen,
  NavigationTab,
  CrmModule,
  PermissionAction,
  ModulePermission,
  RolePermissionsMap,
  UserActivityLog,
  ActivityActionType,
} from '../types';
import { BANESERVICES_LOGO_DATA_URI, COMPANY_NAME_OFFICIAL } from '../assets/logo';

// Clean isolated storage keys
const AUTH_USERS_KEY = 'sirius_auto_crm_users_v2';
const AUTH_SESSION_KEY = 'sirius_auto_crm_session_v2';
const AUTH_PASSWORDS_KEY = 'sirius_auto_crm_passwords_v2';
const AUTH_PERMISSIONS_KEY = 'sirius_auto_crm_permissions_v2';
const AUTH_COMPANY_KEY = 'sirius_auto_crm_company_v2';
const AUTH_AUDIT_LOGS_KEY = 'sirius_auto_crm_audit_logs_v2';

// Standard base permission sets
const allFullPerms: ModulePermission = { voir: true, créer: true, ajouter: true, modifier: true, supprimer: true, exporter: true };
const readOnlyPerms: ModulePermission = { voir: true, créer: false, ajouter: false, modifier: false, supprimer: false, exporter: false };
const readExportPerms: ModulePermission = { voir: true, créer: false, ajouter: false, modifier: false, supprimer: false, exporter: true };
const standardOpPerms: ModulePermission = { voir: true, créer: true, ajouter: true, modifier: true, supprimer: false, exporter: true };
const noPerms: ModulePermission = { voir: false, créer: false, ajouter: false, modifier: false, supprimer: false, exporter: false };

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMap = {
  Directeur: {
    'Tableau de bord': allFullPerms,
    'Parc automobile': allFullPerms,
    'Véhicules': allFullPerms,
    'Clients': allFullPerms,
    'Prospects': allFullPerms,
    'Ventes': allFullPerms,
    'Locations': allFullPerms,
    'Réservations': allFullPerms,
    'Paiements': allFullPerms,
    'Factures': allFullPerms,
    'Dépenses': allFullPerms,
    'Revenus': allFullPerms,
    'Maintenance': allFullPerms,
    'Fournisseurs': allFullPerms,
    'Rapports': allFullPerms,
    'Notifications': allFullPerms,
    'Paramètres': allFullPerms,
    'Assistant IA': allFullPerms,
  },
  Administrateur: {
    'Tableau de bord': allFullPerms,
    'Parc automobile': allFullPerms,
    'Véhicules': allFullPerms,
    'Clients': allFullPerms,
    'Prospects': allFullPerms,
    'Ventes': allFullPerms,
    'Locations': allFullPerms,
    'Réservations': allFullPerms,
    'Paiements': allFullPerms,
    'Factures': allFullPerms,
    'Dépenses': allFullPerms,
    'Revenus': allFullPerms,
    'Maintenance': allFullPerms,
    'Fournisseurs': allFullPerms,
    'Rapports': allFullPerms,
    'Notifications': allFullPerms,
    'Paramètres': allFullPerms,
    'Assistant IA': allFullPerms,
  },
  Gestionnaire: {
    'Tableau de bord': readExportPerms,
    'Parc automobile': allFullPerms,
    'Véhicules': allFullPerms,
    'Clients': allFullPerms,
    'Prospects': allFullPerms,
    'Ventes': allFullPerms,
    'Locations': allFullPerms,
    'Réservations': allFullPerms,
    'Paiements': standardOpPerms,
    'Factures': standardOpPerms,
    'Dépenses': standardOpPerms,
    'Revenus': standardOpPerms,
    'Maintenance': allFullPerms,
    'Fournisseurs': allFullPerms,
    'Rapports': readExportPerms,
    'Notifications': allFullPerms,
    'Paramètres': readOnlyPerms,
    'Assistant IA': allFullPerms,
  },
  Commercial: {
    'Tableau de bord': readOnlyPerms,
    'Parc automobile': readOnlyPerms,
    'Véhicules': readOnlyPerms,
    'Clients': standardOpPerms,
    'Prospects': standardOpPerms,
    'Ventes': standardOpPerms,
    'Locations': standardOpPerms,
    'Réservations': standardOpPerms,
    'Paiements': noPerms,
    'Factures': readExportPerms,
    'Dépenses': noPerms,
    'Revenus': noPerms,
    'Maintenance': readOnlyPerms,
    'Fournisseurs': noPerms,
    'Rapports': noPerms,
    'Notifications': readOnlyPerms,
    'Paramètres': noPerms,
    'Assistant IA': standardOpPerms,
  },
  Caissier: {
    'Tableau de bord': readOnlyPerms,
    'Parc automobile': readOnlyPerms,
    'Véhicules': readOnlyPerms,
    'Clients': readOnlyPerms,
    'Prospects': noPerms,
    'Ventes': readOnlyPerms,
    'Locations': readOnlyPerms,
    'Réservations': readOnlyPerms,
    'Paiements': standardOpPerms,
    'Factures': standardOpPerms,
    'Dépenses': standardOpPerms,
    'Revenus': standardOpPerms,
    'Maintenance': noPerms,
    'Fournisseurs': noPerms,
    'Rapports': readExportPerms,
    'Notifications': readOnlyPerms,
    'Paramètres': noPerms,
    'Assistant IA': noPerms,
  },
  Comptable: {
    'Tableau de bord': readExportPerms,
    'Parc automobile': readOnlyPerms,
    'Véhicules': readOnlyPerms,
    'Clients': readExportPerms,
    'Prospects': noPerms,
    'Ventes': readExportPerms,
    'Locations': readExportPerms,
    'Réservations': readOnlyPerms,
    'Paiements': allFullPerms,
    'Factures': allFullPerms,
    'Dépenses': allFullPerms,
    'Revenus': allFullPerms,
    'Maintenance': readOnlyPerms,
    'Fournisseurs': standardOpPerms,
    'Rapports': allFullPerms,
    'Notifications': readOnlyPerms,
    'Paramètres': noPerms,
    'Assistant IA': noPerms,
  },
  Agent: {
    'Tableau de bord': readOnlyPerms,
    'Parc automobile': readOnlyPerms,
    'Véhicules': readOnlyPerms,
    'Clients': { voir: true, créer: true, ajouter: true, modifier: false, supprimer: false, exporter: false },
    'Prospects': { voir: true, créer: true, ajouter: true, modifier: false, supprimer: false, exporter: false },
    'Ventes': readOnlyPerms,
    'Locations': { voir: true, créer: true, ajouter: true, modifier: false, supprimer: false, exporter: false },
    'Réservations': { voir: true, créer: true, ajouter: true, modifier: false, supprimer: false, exporter: false },
    'Paiements': noPerms,
    'Factures': readOnlyPerms,
    'Dépenses': noPerms,
    'Revenus': noPerms,
    'Maintenance': { voir: true, créer: true, ajouter: true, modifier: false, supprimer: false, exporter: false },
    'Fournisseurs': noPerms,
    'Rapports': noPerms,
    'Notifications': readOnlyPerms,
    'Paramètres': noPerms,
    'Assistant IA': noPerms,
  },
};

const defaultCompanyProfile: CompanyProfile = {
  id: 'bane_corp_1',
  name: COMPANY_NAME_OFFICIAL,
  logoUrl: BANESERVICES_LOGO_DATA_URI,
  phone: '',
  whatsapp: '',
  address: '',
  city: '',
  country: '',
  email: '',
  website: '',
  currency: '',
  currencySymbol: '',
  language: 'Français',
  timeZone: '',
  dateFormat: 'DD/MM/YYYY',
  stampUrl: '',
  signatureUrl: '',
  onboardingCompleted: true,
};

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isConfigured: boolean;
  isFirstLaunch: boolean;
  setIsFirstLaunch: (val: boolean) => void;
  companyProfile: CompanyProfile;
  isAuthenticated: boolean;
  activeAuthScreen: AuthScreen;
  setActiveAuthScreen: (screen: AuthScreen) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  activeProfileTab: 'profile' | 'security' | 'team';
  setActiveProfileTab: (tab: 'profile' | 'security' | 'team') => void;

  // Actions
  createInitialDirector: (data: {
    fullName: string;
    username: string;
    password: string;
    companyName?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  login: (identifier: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  logoutOtherDevices: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  changeUserPassword: (currentPass: string, newPass: string) => { success: boolean; message?: string };
  updateCompanyProfile: (data: Partial<CompanyProfile>) => void;
  completeOnboarding: (data: Partial<CompanyProfile>) => void;
  completeFirstLogin: (updatedData?: Partial<User>, newPassword?: string) => void;

  // Team & RBAC
  addUser: (userData: Omit<User, 'id' | 'createdAt' | 'companyId'>, customPassword?: string) => User;
  updateUser: (userId: string, data: Partial<User>, newPassword?: string) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  toggleUserStatus: (userId: string) => boolean;
  deleteUser: (userId: string) => void;
  switchActiveUser: (userId: string) => void;
  hasPermission: (tab: NavigationTab) => boolean;

  // Granular Permissions
  rolePermissions: RolePermissionsMap;
  updateRolePermission: (role: UserRole, module: CrmModule, action: PermissionAction, value: boolean) => void;
  resetRolePermissions: () => void;
  hasModulePermission: (module: CrmModule, action: PermissionAction) => boolean;

  // Audit Logs
  auditLogs: UserActivityLog[];
  logActivity: (
    paramOrAction:
      | {
          actionType: ActivityActionType | string;
          module: string;
          targetItem?: string;
          description: string;
          operationId?: string;
          previousValue?: string;
          newValue?: string;
          details?: string;
        }
      | ActivityActionType
      | string,
    module?: string,
    description?: string,
    details?: string,
    targetItem?: string,
    operationId?: string,
    previousValue?: string,
    newValue?: string
  ) => void;
  clearAuditLogs: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Users registry (clean persistent storage, no hardcoded users)
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // 2. Active Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const sessionRaw = localStorage.getItem(AUTH_SESSION_KEY);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (parsed && parsed.id) {
          // Verify user still exists in storage and is active
          const usersRaw = localStorage.getItem(AUTH_USERS_KEY);
          if (usersRaw) {
            const parsedUsers = JSON.parse(usersRaw);
            if (Array.isArray(parsedUsers)) {
              const matched = parsedUsers.find((u: User) => u.id === parsed.id);
              if (matched && matched.isActive !== false) {
                return matched;
              }
            }
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // 3. Configuration status
  // True if at least one active Director account exists
  const isConfigured = users.length > 0 && users.some((u) => (u.role === 'Directeur' || u.role === 'Administrateur') && u.isActive !== false);

  // Backward compatibility flag for first launch
  const [isFirstLaunch, setIsFirstLaunchState] = useState<boolean>(!isConfigured);

  const setIsFirstLaunch = (val: boolean) => {
    setIsFirstLaunchState(val);
  };

  // Sync isFirstLaunch with isConfigured
  useEffect(() => {
    setIsFirstLaunchState(!isConfigured);
  }, [isConfigured]);

  // 4. Company Profile
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem(AUTH_COMPANY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultCompanyProfile,
          ...parsed,
          name: parsed.name || COMPANY_NAME_OFFICIAL,
          logoUrl: parsed.logoUrl || BANESERVICES_LOGO_DATA_URI,
        };
      }
      return defaultCompanyProfile;
    } catch {
      return defaultCompanyProfile;
    }
  });

  // 5. Passwords vault (separate secure storage map)
  const [passwordsVault, setPasswordsVault] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(AUTH_PASSWORDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      }
      return {};
    } catch {
      return {};
    }
  });

  // 6. Role Permissions
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(() => {
    try {
      const saved = localStorage.getItem(AUTH_PERMISSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_ROLE_PERMISSIONS, ...parsed };
      }
      return DEFAULT_ROLE_PERMISSIONS;
    } catch {
      return DEFAULT_ROLE_PERMISSIONS;
    }
  });

  // 7. Audit Logs
  const [auditLogs, setAuditLogs] = useState<UserActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(AUTH_AUDIT_LOGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // UI Navigation states: default to 'login' if configured with users, else 'welcome'
  const [activeAuthScreen, setActiveAuthScreen] = useState<AuthScreen>(() => {
    return isConfigured ? 'login' : 'welcome';
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'security' | 'team'>('profile');

  // Persistence helpers
  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    try {
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(newUsers));
    } catch (e) {
      console.error('Failed to persist users:', e);
    }
  };

  const saveSession = (user: User | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to persist session:', e);
    }
  };

  const savePasswordsVault = (newVault: Record<string, string>) => {
    setPasswordsVault(newVault);
    try {
      localStorage.setItem(AUTH_PASSWORDS_KEY, JSON.stringify(newVault));
    } catch (e) {
      console.error('Failed to persist password vault:', e);
    }
  };

  const saveRolePermissions = (newPerms: RolePermissionsMap) => {
    setRolePermissions(newPerms);
    try {
      localStorage.setItem(AUTH_PERMISSIONS_KEY, JSON.stringify(newPerms));
    } catch (e) {
      console.error('Failed to persist permissions:', e);
    }
  };

  const saveAuditLogs = (newLogs: UserActivityLog[]) => {
    setAuditLogs(newLogs);
    try {
      localStorage.setItem(AUTH_AUDIT_LOGS_KEY, JSON.stringify(newLogs.slice(0, 500)));
    } catch (e) {
      console.error('Failed to persist audit logs:', e);
    }
  };

  // Activity Logger
  const logActivity: AuthContextType['logActivity'] = (
    paramOrAction,
    moduleParam,
    descriptionParam,
    detailsParam,
    targetItemParam,
    operationIdParam,
    previousValueParam,
    newValueParam
  ) => {
    let actionType: ActivityActionType | string = 'Autre';
    let module = 'Système';
    let description = '';
    let details: string | undefined = undefined;
    let targetItem = 'Opération';
    let operationId: string | undefined = undefined;
    let previousValue: string | undefined = undefined;
    let newValue: string | undefined = undefined;

    if (typeof paramOrAction === 'object' && paramOrAction !== null) {
      actionType = paramOrAction.actionType;
      module = paramOrAction.module;
      description = paramOrAction.description;
      details = paramOrAction.details;
      targetItem = paramOrAction.targetItem || 'Opération';
      operationId = paramOrAction.operationId;
      previousValue = paramOrAction.previousValue;
      newValue = paramOrAction.newValue;
    } else {
      actionType = paramOrAction as ActivityActionType | string;
      module = moduleParam || 'Système';
      description = descriptionParam || '';
      details = detailsParam;
      targetItem = targetItemParam || 'Opération';
      operationId = operationIdParam;
      previousValue = previousValueParam;
      newValue = newValueParam;
    }

    const logEntry: UserActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser?.id || 'sys_auto',
      userName: currentUser?.fullName || 'Directeur Initial',
      userRole: currentUser?.role || 'Directeur',
      userEmail: currentUser?.email || '',
      actionType,
      module,
      targetItem,
      description: description || `${actionType} sur ${module}`,
      timestamp: new Date().toISOString(),
      operationId,
      previousValue,
      newValue,
      details,
    };

    saveAuditLogs([logEntry, ...auditLogs]);
  };

  const clearAuditLogs = () => {
    saveAuditLogs([]);
  };

  // 1. Initial Setup: Create first Director
  const createInitialDirector = async (data: {
    fullName: string;
    username: string;
    password: string;
    companyName?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const trimmedFullName = data.fullName.trim();
    const trimmedUsername = data.username.trim().toLowerCase();
    const trimmedPassword = data.password.trim();

    if (!trimmedFullName) {
      return { success: false, message: 'Le nom du directeur est obligatoire.' };
    }
    if (!trimmedUsername || trimmedUsername.length < 3) {
      return { success: false, message: "Le nom d'utilisateur doit comporter au moins 3 caractères." };
    }
    if (!trimmedPassword || trimmedPassword.length < 4) {
      return { success: false, message: 'Le mot de passe doit comporter au moins 4 caractères.' };
    }

    // Verify username uniqueness
    const exists = users.some((u) => (u.username || '').toLowerCase() === trimmedUsername);
    if (exists) {
      return { success: false, message: "Ce nom d'utilisateur est déjà utilisé." };
    }

    const newDirectorId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDirector: User = {
      id: newDirectorId,
      username: trimmedUsername,
      fullName: trimmedFullName,
      email: '',
      phone: '',
      role: 'Directeur',
      companyId: companyProfile.id || 'bane_corp_1',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      isFirstLogin: false,
    };

    // Update Company Profile if name provided
    if (data.companyName) {
      const updatedCompany = { ...companyProfile, name: data.companyName };
      setCompanyProfile(updatedCompany);
      try {
        localStorage.setItem(AUTH_COMPANY_KEY, JSON.stringify(updatedCompany));
      } catch (e) {
        console.error('Failed to save company profile', e);
      }
    }

    // Persist user and vault
    const newUsers = [newDirector, ...users];
    saveUsers(newUsers);

    const newVault = { ...passwordsVault, [newDirectorId]: trimmedPassword };
    savePasswordsVault(newVault);

    // Save active session
    saveSession(newDirector);

    // Mark setup complete
    setIsFirstLaunchState(false);

    // Log creation
    const logEntry: UserActivityLog = {
      id: `log_${Date.now()}_init`,
      userId: newDirectorId,
      userName: trimmedFullName,
      userRole: 'Directeur',
      userEmail: newDirector.email,
      actionType: 'Création',
      module: 'Utilisateurs et accès',
      targetItem: 'Compte Directeur',
      description: `Initialisation et création du premier compte Directeur (${trimmedFullName})`,
      timestamp: new Date().toISOString(),
    };
    saveAuditLogs([logEntry, ...auditLogs]);

    return { success: true };
  };

  // 2. Login
  const login = async (
    identifier: string,
    pass: string,
    rememberMe = true
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = pass.trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, message: "Veuillez renseigner votre nom d'utilisateur et mot de passe." };
    }

    // Search user by username or email
    const matchedUser = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === trimmedId) ||
        (u.email && u.email.toLowerCase() === trimmedId)
    );

    if (!matchedUser) {
      return { success: false, message: "Nom d'utilisateur ou mot de passe incorrect." };
    }

    if (matchedUser.isActive === false) {
      return {
        success: false,
        message: 'Ce compte utilisateur a été désactivé. Veuillez contacter le Directeur.',
      };
    }

    // Verify password against vault
    const storedPass = passwordsVault[matchedUser.id];
    const isValidPass = Boolean(storedPass && storedPass === trimmedPass);

    if (!isValidPass) {
      return { success: false, message: "Nom d'utilisateur ou mot de passe incorrect." };
    }

    // Update lastLogin
    const updatedUser: User = {
      ...matchedUser,
      lastLogin: new Date().toISOString(),
    };

    const updatedUsers = users.map((u) => (u.id === matchedUser.id ? updatedUser : u));
    saveUsers(updatedUsers);

    // Set active session
    saveSession(updatedUser);

    logActivity({
      actionType: 'Connexion',
      module: 'Session',
      targetItem: updatedUser.fullName,
      description: `Connexion réussie de ${updatedUser.fullName} (@${updatedUser.username || ''})`,
    });

    return { success: true };
  };

  // 3. Logout
  const logout = () => {
    if (currentUser) {
      logActivity({
        actionType: 'Déconnexion',
        module: 'Session',
        targetItem: currentUser.fullName,
        description: `Déconnexion de l'utilisateur ${currentUser.fullName}`,
      });
    }
    saveSession(null);
    setActiveAuthScreen('login');
  };

  const logoutOtherDevices = () => {
    logActivity({
      actionType: 'Déconnexion',
      module: 'Sécurité',
      targetItem: currentUser?.fullName || 'Utilisateur',
      description: 'Déconnexion de toutes les autres sessions actives demandée',
    });
  };

  // 5. User Profile Update
  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data };
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    saveUsers(updatedUsers);
    saveSession(updatedUser);
    logActivity({
      actionType: 'Modification',
      module: 'Profil',
      targetItem: updatedUser.fullName,
      description: 'Mise à jour des informations personnelles du profil',
    });
  };

  const changeUserPassword = (currentPass: string, newPass: string): { success: boolean; message?: string } => {
    if (!currentUser) return { success: false, message: 'Non connecté.' };
    const stored = passwordsVault[currentUser.id];
    if (stored && stored !== currentPass) {
      return { success: false, message: 'Le mot de passe actuel est incorrect.' };
    }
    if (!newPass || newPass.length < 4) {
      return { success: false, message: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' };
    }
    const newVault = { ...passwordsVault, [currentUser.id]: newPass };
    savePasswordsVault(newVault);
    logActivity({
      actionType: 'Modification',
      module: 'Sécurité',
      targetItem: currentUser.fullName,
      description: 'Modification du mot de passe de connexion réussie',
    });
    return { success: true };
  };

  // 6. Company Profile Update
  const updateCompanyProfile = (data: Partial<CompanyProfile>) => {
    const updated = { ...companyProfile, ...data };
    setCompanyProfile(updated);
    try {
      localStorage.setItem(AUTH_COMPANY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save company profile', e);
    }
    logActivity({
      actionType: 'Modification',
      module: 'Paramètres',
      targetItem: updated.name,
      description: "Mise à jour des coordonnées et paramètres généraux de l'entreprise",
    });
  };

  const completeOnboarding = (data: Partial<CompanyProfile>) => {
    updateCompanyProfile({ ...data, onboardingCompleted: true });
    setIsOnboardingOpen(false);
  };

  const completeFirstLogin = (updatedData?: Partial<User>, newPassword?: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData, isFirstLogin: false };
    if (newPassword) {
      const newVault = { ...passwordsVault, [currentUser.id]: newPassword };
      savePasswordsVault(newVault);
    }
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updated : u));
    saveUsers(updatedUsers);
    saveSession(updated);
  };

  // 7. Team & RBAC Management (Director Only)
  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'companyId'>, customPassword?: string): User => {
    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser: User = {
      ...userData,
      id: newId,
      companyId: companyProfile.id || 'bane_corp_1',
      createdAt: new Date().toISOString(),
      isActive: userData.isActive !== false,
      isFirstLogin: false,
    };

    const newUsers = [...users, newUser];
    saveUsers(newUsers);

    if (customPassword) {
      const newVault = { ...passwordsVault, [newId]: customPassword };
      savePasswordsVault(newVault);
    }

    logActivity({
      actionType: 'Création',
      module: 'Utilisateurs et accès',
      targetItem: newUser.fullName,
      description: `Création du compte utilisateur ${newUser.fullName} avec le rôle ${newUser.role}`,
    });

    return newUser;
  };

  const updateUser = (userId: string, data: Partial<User>, newPassword?: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const updatedUser = { ...targetUser, ...data };
    const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
    saveUsers(updatedUsers);

    if (newPassword && newPassword.trim()) {
      const newVault = { ...passwordsVault, [userId]: newPassword.trim() };
      savePasswordsVault(newVault);
    }

    if (currentUser?.id === userId) {
      saveSession(updatedUser);
    }

    logActivity({
      actionType: 'Modification',
      module: 'Utilisateurs et accès',
      targetItem: updatedUser.fullName,
      description: `Modification des informations du compte utilisateur ${updatedUser.fullName}`,
    });
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    // Protect Director
    if (targetUser.role === 'Directeur' && newRole !== 'Directeur') {
      const directorCount = users.filter((u) => u.role === 'Directeur').length;
      if (directorCount <= 1) {
        console.warn('Cannot demote the only Director.');
        return;
      }
    }

    const prevRole = targetUser.role;
    const updatedUser = { ...targetUser, role: newRole };
    const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
    saveUsers(updatedUsers);

    if (currentUser?.id === userId) {
      saveSession(updatedUser);
    }

    logActivity({
      actionType: 'Changement de statut',
      module: 'Utilisateurs et accès',
      targetItem: targetUser.fullName,
      description: `Attribution du rôle ${newRole} à ${targetUser.fullName} (anciennement ${prevRole})`,
      previousValue: prevRole,
      newValue: newRole,
    });
  };

  const toggleUserStatus = (userId: string): boolean => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return false;

    // Protect Director
    if (targetUser.role === 'Directeur') {
      console.warn('Cannot deactivate the Director.');
      return true;
    }

    const newStatus = targetUser.isActive === false;
    const updatedUser = { ...targetUser, isActive: newStatus };
    const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
    saveUsers(updatedUsers);

    if (currentUser?.id === userId) {
      saveSession(updatedUser);
    }

    logActivity({
      actionType: newStatus ? 'Réactivation' : 'Désactivation',
      module: 'Utilisateurs et accès',
      targetItem: targetUser.fullName,
      description: newStatus
        ? `Réactivation du compte ${targetUser.fullName}`
        : `Désactivation temporaire de l'accès pour ${targetUser.fullName}`,
    });

    return newStatus;
  };

  const deleteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    // Protect Director
    if (targetUser.role === 'Directeur') {
      console.warn('Cannot delete the primary Director.');
      return;
    }

    if (currentUser?.id === userId) {
      console.warn('Cannot delete currently active account.');
      return;
    }

    const updatedUsers = users.filter((u) => u.id !== userId);
    saveUsers(updatedUsers);

    const newVault = { ...passwordsVault };
    delete newVault[userId];
    savePasswordsVault(newVault);

    logActivity({
      actionType: 'Suppression',
      module: 'Utilisateurs et accès',
      targetItem: targetUser.fullName,
      description: `Suppression définitive du compte utilisateur ${targetUser.fullName} (@${targetUser.username || ''})`,
    });
  };

  const switchActiveUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target && target.isActive !== false) {
      saveSession(target);
      logActivity({
        actionType: 'Connexion',
        module: 'Session',
        targetItem: target.fullName,
        description: `Bascule de session vers le compte ${target.fullName}`,
      });
    }
  };

  // 8. Granular Permissions Management
  const updateRolePermission = (
    role: UserRole,
    module: CrmModule,
    action: PermissionAction,
    value: boolean
  ) => {
    if (role === 'Directeur' || role === 'Administrateur') return;

    const currentRolePerms = rolePermissions[role] || {};
    const currentModulePerms = currentRolePerms[module] || {
      voir: false,
      créer: false,
      modifier: false,
      supprimer: false,
      exporter: false,
    };

    const updatedModulePerms = { ...currentModulePerms, [action]: value };
    const updatedRolePerms = { ...currentRolePerms, [module]: updatedModulePerms };
    const updatedAllPerms = { ...rolePermissions, [role]: updatedRolePerms };

    saveRolePermissions(updatedAllPerms);

    logActivity({
      actionType: 'Modification',
      module: 'Permissions',
      targetItem: `${role} • ${module}`,
      description: `Modification de la permission [${action} = ${value ? 'OUI' : 'NON'}] pour le rôle ${role} sur le module ${module}`,
    });
  };

  const resetRolePermissions = () => {
    saveRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    logActivity({
      actionType: 'Modification',
      module: 'Permissions',
      targetItem: 'Matrice globale',
      description: 'Réinitialisation de toutes les permissions aux valeurs par défaut constructeur',
    });
  };

  const hasModulePermission = (module: CrmModule, action: PermissionAction): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Directeur' || currentUser.role === 'Administrateur') {
      return true;
    }

    const modKey = module === 'Véhicules' ? 'Parc automobile' : module;
    const actKey = action === 'ajouter' ? 'créer' : action;

    const rolePerms = rolePermissions[currentUser.role];
    if (!rolePerms) return false;

    const modulePerms = rolePerms[modKey] || rolePerms[module];
    if (!modulePerms) return false;

    if (actKey === 'créer') {
      return Boolean(modulePerms.créer ?? modulePerms.ajouter);
    }
    return Boolean(modulePerms[actKey as keyof ModulePermission]);
  };

  // High level Navigation Tab permission validator
  const hasPermission = (tab: NavigationTab): boolean => {
    if (!currentUser) return false;
    const { role } = currentUser;

    if (role === 'Directeur' || role === 'Administrateur') {
      return true;
    }

    // Tab mapping to modules
    switch (tab) {
      case 'dashboard':
        return hasModulePermission('Tableau de bord', 'voir');
      case 'vehicles':
        return hasModulePermission('Véhicules', 'voir') || hasModulePermission('Parc automobile', 'voir');
      case 'prospects':
        return hasModulePermission('Prospects', 'voir');
      case 'quick-sale':
        return hasModulePermission('Ventes', 'voir');
      case 'quick-rental':
        return hasModulePermission('Locations', 'voir');
      case 'reservations':
        return hasModulePermission('Réservations', 'voir');
      case 'clients':
        return hasModulePermission('Clients', 'voir');
      case 'payments':
        return hasModulePermission('Paiements', 'voir');
      case 'invoices':
        return hasModulePermission('Factures', 'voir');
      case 'expenses':
        return hasModulePermission('Dépenses', 'voir');
      case 'accounting':
        return hasModulePermission('Revenus', 'voir') || hasModulePermission('Factures', 'voir');
      case 'maintenance':
        return hasModulePermission('Maintenance', 'voir');
      case 'suppliers':
        return hasModulePermission('Fournisseurs', 'voir');
      case 'reports':
        return hasModulePermission('Rapports', 'voir');
      case 'notifications':
      case 'whatsapp-notifications':
        return hasModulePermission('Notifications', 'voir');
      case 'ai-assistant':
        return hasModulePermission('Assistant IA', 'voir');
      case 'users':
        return role === 'Directeur' || role === 'Administrateur';
      case 'activity-log':
      case 'settings':
        return hasModulePermission('Paramètres', 'voir') || role === 'Gestionnaire';
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isConfigured,
        isFirstLaunch,
        setIsFirstLaunch,
        companyProfile,
        isAuthenticated: !!currentUser,
        activeAuthScreen,
        setActiveAuthScreen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        activeProfileTab,
        setActiveProfileTab,

        // Actions
        createInitialDirector,
        login,
        logout,
        logoutOtherDevices,
        updateUserProfile,
        changeUserPassword,
        updateCompanyProfile,
        completeOnboarding,
        completeFirstLogin,

        // Team & RBAC
        addUser,
        updateUser,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
        switchActiveUser,
        hasPermission,

        // Granular Permissions
        rolePermissions,
        updateRolePermission,
        resetRolePermissions,
        hasModulePermission,

        // Audit Logs
        auditLogs,
        logActivity,
        clearAuditLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
