import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import {
  Building2,
  Phone,
  MessageSquare,
  MapPin,
  Mail,
  Globe,
  Coins,
  Languages,
  Clock,
  Calendar,
  Image as ImageIcon,
  Stamp,
  FileSignature,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  X,
  ShieldCheck,
} from 'lucide-react';

export const OnboardingWizardModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, companyProfile, completeOnboarding } = useAuth();
  const { updateSettings } = useCrm();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Entreprise
  const [name, setName] = useState(companyProfile.name || '');
  const [logoUrl, setLogoUrl] = useState(companyProfile.logoUrl || '');
  const [phone, setPhone] = useState(companyProfile.phone || '');
  const [whatsapp, setWhatsapp] = useState(companyProfile.whatsapp || '');
  const [address, setAddress] = useState(companyProfile.address || '');
  const [city, setCity] = useState(companyProfile.city || '');
  const [country, setCountry] = useState(companyProfile.country || '');
  const [email, setEmail] = useState(companyProfile.email || '');
  const [website, setWebsite] = useState(companyProfile.website || '');

  // Step 2: Paramètres commerciaux
  const [currency, setCurrency] = useState(companyProfile.currency || '');
  const [currencySymbol, setCurrencySymbol] = useState(companyProfile.currencySymbol || '');
  const [language, setLanguage] = useState(companyProfile.language || 'Français');
  const [timeZone, setTimeZone] = useState(companyProfile.timeZone || '');
  const [dateFormat, setDateFormat] = useState(companyProfile.dateFormat || 'DD/MM/YYYY');

  // Step 3: Documents
  const [stampUrl, setStampUrl] = useState(companyProfile.stampUrl || '');
  const [signatureUrl, setSignatureUrl] = useState(companyProfile.signatureUrl || '');

  // Interactive signature drawing pad
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!isOnboardingOpen) return null;

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Handle Stamp Upload
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setStampUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Handle Signature drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1A1A18';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureUrl('');
      }
    }
  };

  const handleFinish = () => {
    const updated = {
      name,
      logoUrl,
      phone,
      whatsapp,
      address,
      city,
      country,
      email,
      website,
      currency,
      currencySymbol,
      language,
      timeZone,
      dateFormat,
      stampUrl,
      signatureUrl,
    };

    // Save in Auth & Company context
    completeOnboarding(updated);

    // Sync with CRM agency settings
    updateSettings({
      companyName: name || 'Sirius Auto',
      address,
      city,
      phone,
      email,
      website,
      currency,
      currencySymbol,
    });
  };

  const currenciesList = [
    { code: 'EUR', symbol: '€', label: 'Euro (EUR — €)' },
    { code: 'USD', symbol: '$', label: 'Dollar US (USD — $)' },
    { code: 'CAD', symbol: 'CAD$', label: 'Dollar Canadien (CAD)' },
    { code: 'CHF', symbol: 'CHF', label: 'Franc Suisse (CHF)' },
    { code: 'GBP', symbol: '£', label: 'Livre Sterling (GBP — £)' },
    { code: 'MAD', symbol: 'MAD', label: 'Dirham Marocain (MAD)' },
    { code: 'XOF', symbol: 'FCFA', label: 'Franc CFA (XOF)' },
  ];

  return (
    <div
      id="onboarding-wizard-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-2xl max-w-2xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Progress indicator */}
        <div className="px-6 py-5 bg-[#FAFAF8] border-b border-[#E5E5DF] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#5A5A40] text-white uppercase tracking-wider font-mono">
                Étape {step}/3
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                Configuration initiale de l'Entreprise
              </h2>
            </div>
            <p className="text-xs text-[#7A7A72] mt-0.5">
              Personnalisez votre agence avant d'accéder au tableau de bord
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOnboardingOpen(false)}
            className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 border-b border-[#E5E5DF] bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              step === 1
                ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FAFAF8]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">1. Entreprise</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              step === 2
                ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FAFAF8]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span className="hidden sm:inline">2. Paramètres commerciaux</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              step === 3
                ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FAFAF8]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span className="hidden sm:inline">3. Documents & Signatures</span>
          </button>
        </div>

        {/* Wizard Form Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          {/* STEP 1: ENTREPRISE */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nom Entreprise */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Nom commercial de l'entreprise
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nom de votre agence ou concession"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-2">
                    Logo de l'entreprise
                  </label>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="relative w-16 h-16 rounded-xl border border-[#E5E5DF] overflow-hidden bg-white flex items-center justify-center p-1">
                        <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="absolute top-0.5 right-0.5 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#C5C5BF] flex items-center justify-center text-[#9A9A92] bg-white">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0EFEB] text-[#1A1A18] border border-[#E5E5DF] text-xs font-semibold transition-colors cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>{logoUrl ? 'Changer le logo' : 'Téléverser un logo'}</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                      <p className="text-[11px] text-[#7A7A72] mt-1">PNG, JPG, SVG jusqu'à 5 Mo</p>
                    </div>
                  </div>
                </div>

                {/* Téléphone & WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Téléphone principal
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Numéro de standard"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    WhatsApp professionnel
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Numéro WhatsApp clients"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                {/* Adresse & Ville */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Adresse postale
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rue, avenue ou zone d'activité"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ville du siège"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="France, Maroc, Côte d'Ivoire, Canada..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                  />
                </div>

                {/* E-mail & Site Web */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@agence.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Site web
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.monagence.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PARAMÈTRES COMMERCIAUX */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Devise */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Devise principale
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <select
                      value={currency}
                      onChange={(e) => {
                        const sel = currenciesList.find((c) => c.code === e.target.value);
                        if (sel) {
                          setCurrency(sel.code);
                          setCurrencySymbol(sel.symbol);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    >
                      {currenciesList.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Langue */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Langue du système
                  </label>
                  <div className="relative">
                    <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    >
                      <option value="Français">Français (FR)</option>
                      <option value="English">English (US/UK)</option>
                      <option value="Español">Español</option>
                      <option value="العربية">العربية (Arabe)</option>
                    </select>
                  </div>
                </div>

                {/* Fuseau horaire */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Fuseau horaire
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <select
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    >
                      <option value="Europe/Paris (UTC+1)">Europe/Paris (UTC+1)</option>
                      <option value="Africa/Casablanca (UTC+1)">Africa/Casablanca (UTC+1)</option>
                      <option value="Africa/Abidjan (UTC+0)">Africa/Abidjan (UTC+0)</option>
                      <option value="America/Montreal (UTC-5)">America/Montreal (UTC-5)</option>
                      <option value="Asia/Dubai (UTC+4)">Asia/Dubai (UTC+4)</option>
                    </select>
                  </div>
                </div>

                {/* Format de date */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Format de date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    >
                      <option value="DD/MM/YYYY">JJ/MM/AAAA (ex: 31/12/2026)</option>
                      <option value="YYYY-MM-DD">AAAA-MM-JJ (ex: 2026-12-31)</option>
                      <option value="MM/DD/YYYY">MM/JJ/AAAA (ex: 12/31/2026)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENTS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Cachet de l'entreprise */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stamp className="w-4 h-4 text-[#5A5A40]" />
                    <span className="text-xs font-bold text-[#1A1A18]">Cachet de l'entreprise</span>
                  </div>
                  {stampUrl && (
                    <button
                      type="button"
                      onClick={() => setStampUrl('')}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {stampUrl ? (
                    <div className="w-20 h-20 rounded-xl border border-[#E5E5DF] bg-white p-1 flex items-center justify-center">
                      <img src={stampUrl} alt="Cachet" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[#C5C5BF] bg-white flex items-center justify-center text-[#9A9A92]">
                      <Stamp className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0EFEB] text-[#1A1A18] border border-[#E5E5DF] text-xs font-semibold transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>{stampUrl ? 'Remplacer le cachet' : 'Téléverser le cachet'}</span>
                      <input type="file" accept="image/*" onChange={handleStampUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-[#7A7A72] mt-1">
                      Sera apposé sur vos contrats de location et factures de vente
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature du responsable */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-[#5A5A40]" />
                    <span className="text-xs font-bold text-[#1A1A18]">Signature du responsable</span>
                  </div>
                  {signatureUrl && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs text-[#7A7A72] hover:text-rose-500 hover:underline cursor-pointer"
                    >
                      Effacer le tracé
                    </button>
                  )}
                </div>

                <div className="border border-[#E5E5DF] rounded-2xl bg-white p-2">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-24 bg-white rounded-xl touch-none cursor-crosshair border border-dashed border-[#E5E5DF]"
                  />
                </div>
                <p className="text-[11px] text-[#7A7A72]">
                  Signez directement dans le cadre à l'aide de votre souris ou de votre doigt sur écran tactile.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-[#FAFAF8] border-t border-[#E5E5DF] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F0EFEB] text-[#2D2D2A] border border-[#E5E5DF] text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>Suivant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-complete-onboarding"
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Terminer la configuration</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
