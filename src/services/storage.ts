import { Project, GenerationResult, UserProfile, RetailerItem } from '../types';
import { SAMPLE_ROOMS } from '../data/mockData';

const PROJECTS_KEY = 'imagine_projects_v1';
const SAVED_DESIGNS_KEY = 'imagine_saved_designs_v1';
const USER_PROFILE_KEY = 'imagine_user_profile_v1';
const RETAILER_ITEMS_KEY = 'imagen_retailer_items_v1';

const INITIAL_RETAILER_ITEMS: RetailerItem[] = [
  {
    id: 'ret-amz-1',
    name: 'Eames-Style Molded Velvet Armchair with Brass Legs',
    store: 'Amazon',
    category: 'Furniture',
    price: '₹6,499',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Replace chair with an Eames-style emerald green molded velvet armchair with tapered brass legs',
    notes: 'Discovered on Amazon India. Ideal for living room and reading corners.',
    isPinned: true,
    timestamp: Date.now() - 3600000 * 24,
  },
  {
    id: 'ret-amz-2',
    name: 'Asian Paints Royale Luxury Emulsion - Terracotta Sunset',
    store: 'Amazon',
    category: 'Wall Paint',
    price: '₹1,850 / 4L',
    colorHex: '#C86446',
    imageUrl: 'https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Paint the main wall in rich matte Asian Paints Royale Terracotta Sunset (#C86446) with subtle plaster texture',
    notes: 'Warm earthy undertones that bring grounding depth to neutral living rooms.',
    isPinned: false,
    timestamp: Date.now() - 3600000 * 20,
  },
  {
    id: 'ret-amz-3',
    name: 'Monstera Palm Botanical Leaves Vinyl Wall Decal Sticker',
    store: 'Amazon',
    category: 'Wall Sticker',
    price: '₹499',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Add a clean modern botanical monstera and palm leaf wall sticker decal above the seating area',
    notes: 'Removable waterproof matte vinyl decal from Amazon Home Decor.',
    isPinned: false,
    timestamp: Date.now() - 3600000 * 18,
  },
  {
    id: 'ret-amz-4',
    name: 'Minimalist Arco Brass Floor Lamp with Carrara Marble Base',
    store: 'Amazon',
    category: 'Lighting',
    price: '₹8,990',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Add an arched brushed brass floor lamp with heavy white marble base beside the seating',
    notes: 'Mid-century modern architectural sweeping curve.',
    isPinned: false,
    timestamp: Date.now() - 3600000 * 16,
  },
  {
    id: 'ret-flp-1',
    name: 'Bharat Lifestyle 3-Seater Velvet Curved Chesterfield Sofa',
    store: 'Flipkart',
    category: 'Furniture',
    price: '₹24,999',
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Replace sofa with a plush royal sapphire blue velvet curved chesterfield sofa with deep button tufting',
    notes: 'Saved from Flipkart Big Billion Days. Premium high-density foam.',
    isPinned: true,
    timestamp: Date.now() - 3600000 * 14,
  },
  {
    id: 'ret-flp-2',
    name: 'Asian Paints Royale Aspira - Mint Whisper & Sage Plaster',
    store: 'Flipkart',
    category: 'Wall Paint',
    price: '₹2,150 / 4L',
    colorHex: '#9CAF88',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Repaint wall with smooth Asian Paints Royale Aspira in soft organic Sage Green (#9CAF88)',
    notes: 'Biophilic soothing shade for bedrooms and study rooms.',
    isPinned: false,
    timestamp: Date.now() - 3600000 * 12,
  },
  {
    id: 'ret-flp-3',
    name: 'Mandala Geometric Floral Wall Sticker Decal Art',
    store: 'Flipkart',
    category: 'Wall Sticker',
    price: '₹389',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Apply an elegant golden-beige symmetrical bohemian mandala wall decal sticker as a center focal art piece',
    notes: 'Waterproof self-adhesive wall vinyl from Flipkart.',
    isPinned: false,
    timestamp: Date.now() - 3600000 * 10,
  },
  {
    id: 'ret-ikea-1',
    name: 'STRANDMON Wing Chair in Nordvalla Dark Green',
    store: 'IKEA',
    category: 'Furniture',
    price: '₹19,990',
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Replace seating with an IKEA STRANDMON high-back wing chair in deep Nordvalla dark green fabric',
    notes: 'Classic iconic high-back ergonomic reading chair from IKEA.',
    isPinned: false,
    timestamp: Date.now() - 3600000 * 8,
  },
  {
    id: 'ret-ikea-2',
    name: 'STOCKHOLM 2017 Walnut Veneer Oval Coffee Table',
    store: 'IKEA',
    category: 'Furniture',
    price: '₹14,990',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Replace coffee table with an authentic IKEA STOCKHOLM oval natural walnut veneer table',
    notes: 'Durable clear-lacquered real walnut finish with lower magazine shelf.',
    isPinned: false,
    timestamp: Date.now() - 3600000 * 6,
  },
  {
    id: 'ret-ikea-3',
    name: 'KIVIK 3-Seat Sofa in Hillared Anthracite Fabric',
    store: 'IKEA',
    category: 'Furniture',
    price: '₹42,990',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'Transform sofa into an IKEA KIVIK modular 3-seater in textured Anthracite grey with memory foam cushions',
    notes: 'Low armrests and deep pocket springs.',
    isPinned: false,
    timestamp: Date.now() - 3600000 * 4,
  },
];

// Seed initial default projects if empty
function initializeDefaultProjects(): Project[] {
  const initial: Project[] = [
    {
      id: 'proj-living-default',
      name: 'Sunlit Living Lounge',
      roomType: 'Living Room',
      originalImage: SAMPLE_ROOMS[0].url,
      detectedObjects: [
        {
          id: 'sofa-main',
          category: 'Sofa',
          label: 'Tan Leather 3-Seater Sofa',
          box2d: [480, 220, 820, 780],
          currentColor: 'Cognac Tan',
          currentMaterial: 'Distressed Leather',
          suggestions: [
            'Emerald green velvet sofa with brass tapered legs',
            'Modern cloud white bouclé modular sofa',
            'Deep charcoal linen sectional',
          ],
        },
        {
          id: 'table-center',
          category: 'Table',
          label: 'Low Teak Coffee Table',
          box2d: [680, 360, 920, 680],
          currentColor: 'Natural Teak',
          currentMaterial: 'Solid Wood',
          suggestions: [
            'Round white Carrara marble coffee table',
            'Fluted glass and brushed bronze table',
            'Organic sculptural light oak wood table',
          ],
        },
        {
          id: 'wall-back',
          category: 'Wall',
          label: 'Main Accent Wall',
          box2d: [40, 100, 520, 900],
          currentColor: 'Off-White Plaster',
          currentMaterial: 'Drywall',
          suggestions: [
            'Muted sage green limewash paint',
            'Warm terracotta accent wall with picture frame moulding',
            'Vertical acoustic fluted wood slat paneling',
          ],
        },
      ],
      roomSummary: {
        detectedRoomType: 'Living Room',
        currentStyle: 'Contemporary Warm Minimalist',
        lighting: 'Abundant Natural Sunlight (South-facing window)',
        colorPalette: ['#FAF9F6', '#D4A373', '#CCD5AE', '#E9D8A6'],
      },
      generations: [],
      notes: 'Planning to replace the sofa and introduce marble surfaces for a more luxurious modern aesthetic.',
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: 'proj-bedroom-default',
      name: 'Master Suite Retreat',
      roomType: 'Bedroom',
      originalImage: SAMPLE_ROOMS[1].url,
      detectedObjects: [
        {
          id: 'bed-main',
          category: 'Bed',
          label: 'Platform King Bed',
          box2d: [420, 200, 890, 850],
          currentColor: 'Light Oak',
          currentMaterial: 'Wood & Linen',
          suggestions: [
            'Warm oatmeal bouclé upholstered platform bed',
            'Canopy teak bed with brass joins',
            'Minimalist floating Japanese tatami frame',
          ],
        },
      ],
      roomSummary: {
        detectedRoomType: 'Master Bedroom',
        currentStyle: 'Scandinavian Japandi',
        lighting: 'Soft diffused morning daylight',
        colorPalette: ['#FAF8F5', '#EFE9E1', '#8C827A'],
      },
      generations: [],
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 3,
    },
  ];

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(initial));
  return initial;
}

export const storage = {
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(PROJECTS_KEY);
      if (!data) return initializeDefaultProjects();
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initializeDefaultProjects();
    } catch {
      return initializeDefaultProjects();
    }
  },

  saveProject(project: Project): void {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = { ...project, updatedAt: Date.now() };
    } else {
      projects.unshift({ ...project, createdAt: Date.now(), updatedAt: Date.now() });
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  deleteProject(projectId: string): void {
    const projects = this.getProjects().filter((p) => p.id !== projectId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  getProjectById(projectId: string): Project | undefined {
    return this.getProjects().find((p) => p.id === projectId);
  },

  addGenerationToProject(projectId: string, generation: GenerationResult): void {
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      project.generations = [generation, ...(project.generations || [])];
      project.updatedAt = Date.now();
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }
    // Also save into SavedDesigns if marked favorite
    this.syncSavedDesigns();
  },

  toggleGenerationFavorite(projectId: string, generationId: string): boolean {
    const projects = this.getProjects();
    let isFav = false;
    for (const project of projects) {
      if (project.id === projectId && project.generations) {
        const gen = project.generations.find((g) => g.id === generationId);
        if (gen) {
          gen.isFavorite = !gen.isFavorite;
          isFav = !!gen.isFavorite;
          break;
        }
      }
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    this.syncSavedDesigns();
    return isFav;
  },

  syncSavedDesigns(): GenerationResult[] {
    const projects = this.getProjects();
    const favs: GenerationResult[] = [];
    for (const p of projects) {
      for (const g of p.generations || []) {
        if (g.isFavorite) {
          favs.push(g);
        }
      }
    }
    localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(favs));
    return favs;
  },

  getSavedDesigns(): GenerationResult[] {
    try {
      const data = localStorage.getItem(SAVED_DESIGNS_KEY);
      if (data) return JSON.parse(data);
      return this.syncSavedDesigns();
    } catch {
      return [];
    }
  },

  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(USER_PROFILE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}

    const defaultProfile: UserProfile = {
      name: 'Priya Kalathy',
      email: 'priya.kalathy1984@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      credits: 25,
      tier: 'Pro Designer',
      savedDesignsCount: 0,
      isAuthenticated: false,
    };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  updateUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
    return updated;
  },

  loginWithGoogle(userData?: { name?: string; email?: string; avatarUrl?: string }): UserProfile {
    const current = this.getUserProfile();
    const updated: UserProfile = {
      ...current,
      name: userData?.name || 'Priya Kalathy',
      email: userData?.email || 'priya.kalathy1984@gmail.com',
      avatarUrl: userData?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isAuthenticated: true,
      authProvider: 'google',
      joinedAt: current.joinedAt || Date.now(),
    };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
    return updated;
  },

  loginAsGuest(): UserProfile {
    const current = this.getUserProfile();
    const updated: UserProfile = {
      ...current,
      name: 'Guest Designer',
      email: 'guest@imagine.design',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      isAuthenticated: true,
      authProvider: 'guest',
      joinedAt: current.joinedAt || Date.now(),
    };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
    return updated;
  },

  signOut(): UserProfile {
    const current = this.getUserProfile();
    const loggedOut: UserProfile = {
      ...current,
      isAuthenticated: false,
    };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(loggedOut));
    return loggedOut;
  },

  useCredit(): boolean {
    const profile = this.getUserProfile();
    if (profile.credits <= 0) return false;
    profile.credits -= 1;
    this.updateUserProfile(profile);
    return true;
  },

  replenishCredits(amount = 25): void {
    const profile = this.getUserProfile();
    profile.credits += amount;
    this.updateUserProfile(profile);
  },

  getRetailerItems(): RetailerItem[] {
    try {
      const data = localStorage.getItem(RETAILER_ITEMS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    // Seed defaults
    localStorage.setItem(RETAILER_ITEMS_KEY, JSON.stringify(INITIAL_RETAILER_ITEMS));
    return INITIAL_RETAILER_ITEMS;
  },

  saveRetailerItem(item: RetailerItem): void {
    const items = this.getRetailerItems();
    const existingIndex = items.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(RETAILER_ITEMS_KEY, JSON.stringify(items));
  },

  deleteRetailerItem(id: string): void {
    const items = this.getRetailerItems().filter((i) => i.id !== id);
    localStorage.setItem(RETAILER_ITEMS_KEY, JSON.stringify(items));
  },

  togglePinRetailerItem(id: string): boolean {
    const items = this.getRetailerItems();
    let newPinned = false;
    const item = items.find((i) => i.id === id);
    if (item) {
      item.isPinned = !item.isPinned;
      newPinned = item.isPinned;
      localStorage.setItem(RETAILER_ITEMS_KEY, JSON.stringify(items));
    }
    return newPinned;
  },

  getPinnedRetailerItems(): RetailerItem[] {
    return this.getRetailerItems().filter((i) => i.isPinned);
  },
};
