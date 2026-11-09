import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  Project,
  GenerationResult,
  UserProfile,
  InspirationItem,
  ProductItem,
} from './types';
import { storage } from './services/storage';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { Studio } from './components/studio/Studio';
import { MySpaces } from './components/spaces/MySpaces';
import { ExploreSection } from './components/explore/ExploreSection';
import { ProductDiscovery } from './components/products/ProductDiscovery';
import { SmartRoomAssistant } from './components/assistant/SmartRoomAssistant';
import { SavedDesigns } from './components/saved/SavedDesigns';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { DreamArchitect } from './components/architect/DreamArchitect';
import { LandingAuth } from './components/auth/LandingAuth';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>(storage.getUserProfile());
  const [projects, setProjects] = useState<Project[]>(storage.getProjects());
  const [savedDesigns, setSavedDesigns] = useState<GenerationResult[]>(storage.getSavedDesigns());
  const [activeProject, setActiveProject] = useState<Project | null>(projects[0] || null);

  // Sync state from storage
  const refreshData = () => {
    const prof = storage.getUserProfile();
    setUserProfile(prof);
    const projs = storage.getProjects();
    setProjects(projs);
    setSavedDesigns(storage.getSavedDesigns());
    if (activeProject) {
      const updatedActive = projs.find((p) => p.id === activeProject.id);
      if (updatedActive) setActiveProject(updatedActive);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLoginGoogle = (userData?: { name?: string; email?: string; avatarUrl?: string }) => {
    const updated = storage.loginWithGoogle(userData);
    setUserProfile(updated);
    setCurrentTab('home');
  };

  const handleContinueAsGuest = () => {
    const updated = storage.loginAsGuest();
    setUserProfile(updated);
    setCurrentTab('home');
  };

  const handleSignOut = () => {
    const updated = storage.signOut();
    setUserProfile(updated);
  };

  // Handlers for cross-component workflows
  const handleOpenProjectInStudio = (project: Project) => {
    setActiveProject(project);
    setCurrentTab('studio');
  };

  const handleNewTransformation = () => {
    setActiveProject(null);
    setCurrentTab('studio');
  };

  const handleTryStyleFromExplore = (item: InspirationItem) => {
    // Create new project with this room style
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: `${item.title}`,
      roomType: (item.roomType as any) || 'Living Room',
      originalImage: item.imageUrl,
      detectedObjects: [
        {
          id: 'obj-focus',
          category: item.targetCategory,
          label: `${item.targetCategory} Area`,
          box2d: [400, 200, 850, 800],
          suggestions: [item.suggestedPrompt],
        },
      ],
      generations: [],
      notes: `Inspired by "${item.title}": ${item.transformationGoal}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    storage.saveProject(newProj);
    refreshData();
    setActiveProject(newProj);
    setCurrentTab('studio');
  };

  const handlePlaceProductInRoom = (product: ProductItem) => {
    // If active project exists, use it; otherwise use the first sample room project
    let targetProj = activeProject || projects[0];
    if (!targetProj) {
      const initial = storage.getProjects();
      targetProj = initial[0];
    }
    setActiveProject(targetProj);
    setCurrentTab('studio');
  };

  const handleApplyPromptFromAssistant = (promptText: string, objectCategory?: string) => {
    setCurrentTab('studio');
  };

  const [architectPreselectedStyle, setArchitectPreselectedStyle] = useState<string | null>(null);

  const handleGenerateArchitectFromExplore = (style: string, prompt?: string) => {
    setArchitectPreselectedStyle(style);
    setCurrentTab('architect');
  };

  const handleOpenArchitectInStudio = (imageSrc: string, prompt?: string) => {
    const newProj: Project = {
      id: `proj-architect-${Date.now()}`,
      name: `Architectural Dream Project`,
      roomType: 'Living Room',
      originalImage: imageSrc,
      detectedObjects: [
        {
          id: 'obj-arch-focus',
          category: 'Architecture',
          label: 'Primary Architectural Space',
          box2d: [250, 150, 850, 850],
          suggestions: [
            prompt || 'Upgrade with travertine limestone, warm oak paneling, and ambient cove illumination',
          ],
        },
      ],
      generations: [],
      notes: prompt || 'Generated with Dream House AI',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    storage.saveProject(newProj);
    refreshData();
    setActiveProject(newProj);
    setCurrentTab('studio');
  };

  const handleRemoveFavorite = (gen: GenerationResult) => {
    storage.toggleGenerationFavorite(gen.projectId, gen.id);
    refreshData();
  };

  // First page entering this app: if not authenticated, show beautiful LandingAuth with Google Sign In
  if (!userProfile.isAuthenticated) {
    return (
      <LandingAuth
        onLoginGoogle={handleLoginGoogle}
        onContinueAsGuest={handleContinueAsGuest}
        initialProfile={userProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        userProfile={userProfile}
        onNewTransformation={handleNewTransformation}
        onSignOut={handleSignOut}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeDashboard
            onNavigateTab={setCurrentTab}
            onOpenProject={handleOpenProjectInStudio}
            recentProjects={projects}
            savedDesigns={savedDesigns}
          />
        )}

        {currentTab === 'studio' && (
          <Studio
            key={activeProject?.id || 'new-studio'}
            initialProject={activeProject}
            onNavigateTab={setCurrentTab}
            onProjectUpdated={refreshData}
          />
        )}

        {currentTab === 'architect' && (
          <DreamArchitect
            onOpenInStudio={handleOpenArchitectInStudio}
            initialStyle={architectPreselectedStyle}
          />
        )}

        {currentTab === 'spaces' && (
          <MySpaces
            projects={projects}
            onOpenProject={handleOpenProjectInStudio}
            onRefreshProjects={refreshData}
            onNewSpace={handleNewTransformation}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreSection
            onTryStyle={handleTryStyleFromExplore}
            onGenerateArchitect={handleGenerateArchitectFromExplore}
          />
        )}

        {currentTab === 'products' && (
          <ProductDiscovery onPlaceProductInRoom={handlePlaceProductInRoom} />
        )}

        {currentTab === 'assistant' && (
          <SmartRoomAssistant
            currentProject={activeProject}
            onApplyPromptToStudio={handleApplyPromptFromAssistant}
            availableProjects={projects}
            onSelectProject={(p) => setActiveProject(p)}
          />
        )}

        {currentTab === 'saved' && (
          <SavedDesigns
            savedDesigns={savedDesigns}
            onOpenInStudio={(gen) => {
              const proj = projects.find((p) => p.id === gen.projectId);
              if (proj) setActiveProject(proj);
              setCurrentTab('studio');
            }}
            onRemoveFavorite={handleRemoveFavorite}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileSettings
            userProfile={userProfile}
            onProfileUpdated={refreshData}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Footer (hidden on full-screen assistant mode) */}
      {currentTab !== 'assistant' && (
        <footer className="bg-white border-t border-stone-200/80 py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#0e2a33] border border-stone-800/10 shadow-sm flex items-center justify-center p-0.5">
              <img
                src="/assets/aistudio/IMAGINE_LOGO_dc9df7db.png"
                alt="IMAGINE Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-sm text-stone-900 tracking-tight font-display">
                IMAGINE
              </span>
              <p className="text-xs text-stone-400">See it. Place it. Love it.</p>
            </div>
          </div>

          <p className="text-xs text-stone-400 text-center sm:text-right">
            AI-Powered Home Decor Visualisation & Product Placement Platform
          </p>
        </div>
      </footer>
      )}
    </div>
  );
}
