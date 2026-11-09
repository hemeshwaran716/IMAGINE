export type NavigationTab = 'home' | 'studio' | 'architect' | 'spaces' | 'explore' | 'products' | 'assistant' | 'saved' | 'profile';

export type TransformationMethod = 'text' | 'product' | 'picker';

export interface DreamHouseConfig {
  houseType: string; // e.g. 'Modern Minimalist Villa', 'Penthouse', 'Coastal Haven', 'Scandinavian A-Frame', 'Japandi Courtyard'
  architecturalStyle: string; // 'Japandi', 'Modern Brutalist', 'Tropical Modern', 'Contemporary Luxury', etc.
  floorsAndLayout: string; // '2-Storey with double-height living & infinity pool'
  environment: string; // 'Lush Hills / Forest', 'Oceanfront', 'Urban Skyline', 'Suburban Oasis'
  keyFeatures: string[]; // ['Courtyard Garden', 'Floor-to-Ceiling Glass', 'Cantilevered Balcony', 'Outdoor Firepit']
  materials: string[]; // ['Limestone', 'Fluted Teak', 'Black Metal', 'Travertine']
  customPrompt?: string;
  referenceImage?: string; // Optional user sketch or photo
}

export interface RoomSpec {
  roomName: string;
  dimensions: string;
  keyDesignElements: string[];
  recommendedFurniture: string[];
  lightingDesign: string;
}

export interface DreamHousePlan {
  id: string;
  conceptName: string;
  tagline: string;
  architecturalStyle: string;
  propertyType: string;
  overviewStory: string;
  exteriorDescription: string;
  floorPlanSummary: string;
  rooms: RoomSpec[];
  materialsMoodboard: {
    material: string;
    application: string;
    colorHex: string;
  }[];
  budgetEstimate: {
    constructionTier: string;
    estimatedCostINR: string;
    estimatedCostUSD: string;
  };
  spatialFlowNotes: string;
  vastuFengShuiScore?: number; // 1-100
  renderImageUrl: string;
  galleryImages?: Array<{ title: string; url: string; angle: string }>;
  timestamp: number;
}

export interface DesignCritiqueResult {
  overallScore: number; // 1-100
  verdict: 'Exceptional' | 'Promising with Minor Flaws' | 'Needs Spatial Realignment' | 'Visually Conflicted';
  aestheticRating: number; // 1-10
  functionalityRating: number; // 1-10
  lightingRating: number; // 1-10
  critiqueSummary: string;
  strengths: string[];
  concernsAndFlaws: string[];
  actionableImprovements: {
    priority: 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
  }[];
  suggestedColorAdjustments: {
    name: string;
    hex: string;
    rationale: string;
  }[];
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedObject {
  id: string;
  category: string;
  label: string;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  currentColor?: string;
  currentMaterial?: string;
  suggestions: string[];
}

export interface RoomSummary {
  detectedRoomType: string;
  currentStyle: string;
  lighting?: string;
  colorPalette: string[];
}

export interface TransformationConfig {
  method: TransformationMethod;
  selectedObject: DetectedObject | null;
  textPrompt: string;
  productImage?: string; // Data URL or URL
  productName?: string;
  colors: string[];
  materials: string[];
  style: string;
  customNotes?: string;
}

export interface GenerationResult {
  id: string;
  projectId: string;
  timestamp: number;
  originalImage: string;
  generatedImage: string;
  maskImage?: string;
  selectedObject: DetectedObject | null;
  method: TransformationMethod;
  promptDescription: string;
  designTitle: string;
  stylingRationale: string;
  accentColors: string[];
  suggestedAccessories: string[];
  isFavorite?: boolean;
}

export interface Project {
  id: string;
  name: string;
  roomType: 'Living Room' | 'Bedroom' | 'Dining Room' | 'Kitchen' | 'Study / Office' | 'Balcony' | 'Other';
  originalImage: string;
  additionalImages?: string[];
  detectedObjects: DetectedObject[];
  roomSummary?: RoomSummary;
  generations: GenerationResult[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  retailer: 'IKEA India' | 'Pepperfry' | 'Urban Ladder' | 'Amazon India' | 'West Elm';
  priceINR: number;
  imageUrl: string;
  material: string;
  dimensions: string;
  style: string;
  description: string;
}

export interface InspirationItem {
  id: string;
  title: string;
  style: string;
  roomType: string;
  description: string;
  imageUrl: string;
  transformationGoal: string;
  suggestedPrompt: string;
  targetCategory: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  keyRecommendations?: string[];
  suggestedTransformations?: {
    title: string;
    objectCategory: string;
    actionPrompt: string;
  }[];
  suggestedColorPalette?: {
    name: string;
    hex: string;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  credits: number;
  tier: 'Free Trial' | 'Pro Designer' | 'Enterprise';
  savedDesignsCount: number;
  isAuthenticated?: boolean;
  authProvider?: 'google' | 'guest';
  joinedAt?: number;
}

export type RetailerStore = 'Amazon' | 'Flipkart' | 'IKEA' | 'Other';
export type RetailerCategory = 'Furniture' | 'Wall Paint' | 'Wall Sticker' | 'Lighting' | 'Decor' | 'Curtains';

export interface RetailerItem {
  id: string;
  name: string;
  store: RetailerStore;
  category: RetailerCategory;
  imageUrl: string;
  price?: string;
  colorHex?: string;
  productUrl?: string;
  suggestedPrompt?: string;
  notes?: string;
  isPinned?: boolean;
  timestamp: number;
}
