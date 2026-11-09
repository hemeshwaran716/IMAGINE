import React from 'react';
import {
  Sparkles,
  Home,
  Wand2,
  FolderKanban,
  Compass,
  ShoppingBag,
  MessageSquare,
  Bookmark,
  User,
  Plus,
  Castle,
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  userProfile: UserProfile;
  onNewTransformation: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  userProfile,
  onNewTransformation,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-[#0e2a33] border border-stone-800/10 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center p-0.5">
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
                <p className="text-[11px] font-medium text-stone-500 tracking-wider hidden sm:block">
                  See it. Place it. Love it.
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 bg-stone-100/70 p-1.5 rounded-full border border-stone-200/60">
              <button
                onClick={() => onTabChange('home')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentTab === 'home'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </button>
              <button
                onClick={() => onTabChange('studio')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentTab === 'studio'
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                AI Studio
              </button>
              <button
                onClick={() => onTabChange('architect')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentTab === 'architect'
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Castle className="w-3.5 h-3.5" />
                Architect
              </button>
              <button
                onClick={() => onTabChange('spaces')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentTab === 'spaces'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                My Spaces
              </button>
              <button
                onClick={() => onTabChange('explore')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentTab === 'explore'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Explore
              </button>
              <button
                onClick={() => onTabChange('products')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentTab === 'products'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Products
              </button>
              <button
                onClick={() => onTabChange('assistant')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentTab === 'assistant'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                Room AI
              </button>
              <button
                onClick={() => onTabChange('saved')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentTab === 'saved'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Saved
              </button>
            </nav>
          </div>

          {/* Right Action Elements */}
          <div className="flex items-center gap-3">
            {/* Credits Counter Pill */}
            <div
              onClick={() => onTabChange('profile')}
              title="Available AI Generation Credits"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-900 text-xs font-semibold cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{userProfile.credits}</span>
              <span className="hidden sm:inline font-normal text-amber-700">Credits</span>
            </div>

            {/* Quick Launch CTA */}
            <button
              onClick={onNewTransformation}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>Visualise Room</span>
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => onTabChange('profile')}
              className={`p-0.5 rounded-full transition-all focus:outline-none ${
                currentTab === 'profile'
                  ? 'ring-2 ring-orange-500 ring-offset-2'
                  : 'hover:ring-2 hover:ring-stone-300 ring-offset-1'
              }`}
              title="Account & Settings"
            >
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-9 h-9 rounded-full object-cover border border-stone-200"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/80 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'home' ? 'text-orange-600' : 'text-stone-500'
          }`}
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        <button
          onClick={() => onTabChange('studio')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
            currentTab === 'studio' ? 'text-orange-600' : 'text-stone-500'
          }`}
        >
          <div className="w-5 h-5 rounded-md bg-orange-500 text-white flex items-center justify-center">
            <Wand2 className="w-3 h-3" />
          </div>
          Studio
        </button>
        <button
          onClick={() => onTabChange('architect')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
            currentTab === 'architect' ? 'text-orange-600' : 'text-stone-500'
          }`}
        >
          <Castle className="w-4 h-4 text-orange-500" />
          Architect
        </button>
        <button
          onClick={() => onTabChange('spaces')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'spaces' ? 'text-orange-600' : 'text-stone-500'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          Spaces
        </button>
        <button
          onClick={() => onTabChange('explore')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'explore' ? 'text-orange-600' : 'text-stone-500'
          }`}
        >
          <Compass className="w-4 h-4" />
          Explore
        </button>
        <button
          onClick={() => onTabChange('assistant')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'assistant' ? 'text-orange-600' : 'text-stone-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Room AI
        </button>
      </div>
    </header>
  );
};
