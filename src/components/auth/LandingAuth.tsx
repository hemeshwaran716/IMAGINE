import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Wand2,
  Castle,
  Layers,
  Palette,
  Eye,
  Lock,
  Camera,
  Edit3,
  Upload,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface LandingAuthProps {
  onLoginGoogle: (profileData?: { name?: string; email?: string; avatarUrl?: string }) => void;
  onContinueAsGuest: () => void;
  initialProfile?: UserProfile;
}

export const LandingAuth: React.FC<LandingAuthProps> = ({
  onLoginGoogle,
  onContinueAsGuest,
  initialProfile,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string>(
    initialProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  );
  const [customName, setCustomName] = useState<string>(initialProfile?.name || 'Priya Kalathy');
  const [customEmail, setCustomEmail] = useState<string>(initialProfile?.email || 'priya.kalathy1984@gmail.com');
  const [showCustomizer, setShowCustomizer] = useState(false);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickSignIn = () => {
    setIsSigningIn(true);
    setTimeout(() => {
      onLoginGoogle({
        name: customName,
        email: customEmail,
        avatarUrl: customAvatar,
      });
      setIsSigningIn(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-orange-200/35 via-amber-100/25 to-transparent rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-gradient-to-tr from-stone-200/40 via-orange-100/20 to-transparent rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      {/* Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-[#0e2a33] border border-stone-800/10 shadow-md flex items-center justify-center p-0.5">
            <img
              src="/assets/aistudio/IMAGINE_LOGO_dc9df7db.png"
              alt="IMAGINE Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-stone-900 font-display">
                IMAGINE
              </span>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 tracking-wider">
              See it. Place it. Love it.
            </p>
          </div>
        </div>

        <button
          onClick={onContinueAsGuest}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 px-3.5 py-1.5 rounded-full hover:bg-stone-100 transition-colors"
        >
          Explore as Guest &rarr;
        </button>
      </header>

      {/* Hero & Login Section */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Brand Story & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold shadow-2xs mb-6">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>AI-Powered Home Decor & Architectural Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight font-display leading-[1.12]">
              Visualize your dream space{' '}
              <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                before you spend a rupee.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-xl">
              Upload your actual room, pin furniture & decor screenshots from <strong>Amazon</strong>, <strong>Flipkart</strong>, or <strong>IKEA</strong>, and let <strong>IMAGEN</strong> intelligently place, re-materialize, and render photorealistic designs while preserving your room’s architecture.
            </p>

            {/* Feature Highlights Pills */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-xs font-semibold text-stone-700">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <span>Real Room AI Inpainting</span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Amazon, Flipkart & IKEA Taskbar</span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Castle className="w-3.5 h-3.5" />
                </div>
                <span>IMAGEN Architect & imENRATION</span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <span>Realistic Lighting & Shadows</span>
              </div>
            </div>
          </div>

          {/* Right Column: Google Sign In Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl border border-stone-200/90 relative">
              {/* Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="h-9 w-9 rounded-xl overflow-hidden bg-[#0e2a33] border border-stone-800/10 flex items-center justify-center p-0.5">
                  <img
                    src="/assets/aistudio/IMAGINE_LOGO_dc9df7db.png"
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Sign-In</span>
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-stone-900 font-display">
                Sign In to IMAGINE
              </h2>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Connect your account to access your spaces, retailer wishlists, and 25 free AI generation credits.
              </p>

              {/* User Account / Picture Preview Card */}
              <div className="mt-5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <img
                      src={customAvatar}
                      alt={customName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 shadow-sm"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Upload your own picture"
                    >
                      <Camera className="w-4 h-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-stone-900">{customName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700">
                        Ready
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">{customEmail}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomizer(!showCustomizer)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
                  title="Customize picture or name"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Optional Customizer Collapse */}
              {showCustomizer && (
                <div className="mt-3 p-3 rounded-2xl bg-orange-50/60 border border-orange-200/70 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                      Your Profile Details
                    </span>
                    <label
                      htmlFor="avatar-upload-btn"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload My Photo</span>
                    </label>
                    <input
                      id="avatar-upload-btn"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                      Google Email
                    </label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs"
                      placeholder="you@gmail.com"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-5 space-y-3">
                {/* 1-Tap Google Sign In */}
                <button
                  type="button"
                  disabled={isSigningIn}
                  onClick={handleQuickSignIn}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-orange-500 font-extrabold text-xs sm:text-sm shadow-xs transition-all hover:scale-101 active:scale-99 group"
                >
                  {isSigningIn ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <>
                      {/* Google G Icon */}
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 group-hover:text-orange-500 transition-transform ml-auto" />
                    </>
                  )}
                </button>

                {/* Continue as Guest */}
                <div className="relative py-1 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <span className="relative bg-white px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Or
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs transition-all shadow-sm"
                >
                  <span>Continue to App as Guest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Security Footnote */}
              <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-stone-400" />
                  <span>Safe OAuth 2.0 Auth</span>
                </div>
                <span>Free 25 AI Credits</span>
              </div>
            </div>

            {/* Quick Preview Card */}
            <div className="mt-4 p-4 rounded-2xl bg-orange-50/70 border border-orange-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Live Preview Available</div>
                  <div className="text-[11px] text-stone-600">Explore architectural typologies and rooms without barrier</div>
                </div>
              </div>
              <button
                onClick={onContinueAsGuest}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline flex-shrink-0"
              >
                Instant Try
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
        <div>
          <strong className="text-stone-800 font-display">IMAGINE</strong> • See it. Place it. Love it.
        </div>
        <p>AI-Powered Home Decor Visualisation & Product Placement Platform</p>
      </footer>
    </div>
  );
};
