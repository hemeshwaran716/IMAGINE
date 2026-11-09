import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Shield,
  Palette,
  Download,
  Trash2,
  Check,
  CreditCard,
  RefreshCw,
  LogOut,
  Mail,
  Zap,
  Camera,
  Upload,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { storage } from '../../services/storage';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  onProfileUpdated: () => void;
  onSignOut?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userProfile,
  onProfileUpdated,
  onSignOut,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isReplenishing, setIsReplenishing] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateUserProfile({ name, email });
    onProfileUpdated();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReplenishCredits = () => {
    setIsReplenishing(true);
    setTimeout(() => {
      storage.replenishCredits(25);
      onProfileUpdated();
      setIsReplenishing(false);
    }, 600);
  };

  const handleExportData = () => {
    const projects = storage.getProjects();
    const profile = storage.getUserProfile();
    const exportObj = {
      profile,
      projects,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imagine-portfolio-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Reset all saved projects and designs to default demonstration templates?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Account & Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 font-display">User Profile & Settings</h1>
        <p className="text-sm text-stone-600 mt-1">
          Manage your design credits, personal details, rendering presets, and exported projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Credits */}
        <div className="flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-stone-100 shadow-md group-hover:opacity-85 transition-opacity"
              />
              <label
                htmlFor="profile-avatar-input"
                className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                title="Upload your own picture"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Change</span>
              </label>
              <input
                id="profile-avatar-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        storage.updateUserProfile({ avatarUrl: reader.result });
                        onProfileUpdated();
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-display">{userProfile.name}</h3>
            <p className="text-xs text-stone-500 mt-0.5">{userProfile.email}</p>
            <span className="mt-3 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold">
              {userProfile.tier}
            </span>
          </div>

          {/* Credits Box */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-100">
                  Generation Balance
                </span>
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <div className="text-4xl font-extrabold font-display">{userProfile.credits}</div>
              <p className="text-xs text-orange-100 mt-1">
                AI Inpainting & High-Resolution Render Credits
              </p>
            </div>

            <button
              onClick={handleReplenishCredits}
              disabled={isReplenishing}
              className="mt-6 w-full py-2.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReplenishing ? 'animate-spin' : ''}`} />
              <span>{isReplenishing ? 'Adding...' : 'Replenish +25 Free Credits'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Personal Information Form */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-4 font-display">
              Personal Information
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Profile updated successfully!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* AI Rendering & Performance Settings */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-4 font-display">
              AI Rendering Presets
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Photorealistic Texture Blend</h4>
                  <p className="text-[11px] text-stone-500">
                    Calculates surface roughness, specular shine, and ambient occlusions
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Room Lighting Preservation</h4>
                  <p className="text-[11px] text-stone-500">
                    Matches color temperature (warm incandescent vs. daylight)
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Data & Export */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-2 font-display">
              Data Management & Backup
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Your room photos and generated variations are stored locally on your device for absolute privacy.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:border-orange-500 hover:text-orange-600 text-xs font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Portfolio Backup (.JSON)</span>
              </button>

              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Demo Data</span>
              </button>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4 text-orange-400" />
                  <span>Switch Account / Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
