import { DetectedObject, RoomSummary, TransformationConfig } from '../types';

export interface DetectObjectsResponse {
  success: boolean;
  detectedObjects: DetectedObject[];
  roomSummary: RoomSummary;
  error?: string;
}

export interface TransformRoomResponse {
  success: boolean;
  generatedImageUrl: string | null;
  modelUsed?: string;
  notes?: string;
  designerCritique: {
    designTitle: string;
    stylingRationale: string;
    accentColors: string[];
    suggestedAccessories: string[];
    estimatedCostTier?: string;
  };
  error?: string;
}

export interface AssistantResponse {
  success: boolean;
  replyText: string;
  keyRecommendations: string[];
  suggestedTransformations: {
    title: string;
    objectCategory: string;
    actionPrompt: string;
  }[];
  suggestedColorPalette?: {
    name: string;
    hex: string;
  }[];
  error?: string;
}

export const api = {
  async getStatus() {
    try {
      const res = await fetch('/api/status');
      return await res.json();
    } catch {
      return { status: 'offline', hasApiKey: false };
    }
  },

  async detectObjects(imageBase64OrUrl: string): Promise<DetectObjectsResponse> {
    const res = await fetch('/api/ai/detect-objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64OrUrl }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to detect objects (HTTP ${res.status})`);
    }

    return await res.json();
  },

  async transformRoom(params: {
    roomImage: string;
    selectedObject: DetectedObject | null;
    maskImage?: string;
    transformationMethod: 'text' | 'product' | 'picker';
    promptText: string;
    productImage?: string;
    materials?: string[];
    colors?: string[];
    style?: string;
    customNotes?: string;
  }): Promise<TransformRoomResponse> {
    const res = await fetch('/api/ai/transform-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Transformation request failed (HTTP ${res.status})`);
    }

    return await res.json();
  },

  async askInteriorAssistant(params: {
    message: string;
    roomImage?: string;
    history?: { role: string; content: string }[];
    roomContext?: any;
  }): Promise<AssistantResponse> {
    const res = await fetch('/api/ai/interior-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Assistant request failed (HTTP ${res.status})`);
    }

    return await res.json();
  },

  async analyzeRoom(imageBase64OrUrl: string) {
    const res = await fetch('/api/ai/analyze-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomImage: imageBase64OrUrl }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Analysis request failed (HTTP ${res.status})`);
    }

    return await res.json();
  },

  async generateDreamHouse(params: import('../types').DreamHouseConfig): Promise<{ success: boolean; plan: import('../types').DreamHousePlan }> {
    const res = await fetch('/api/ai/dream-house/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Dream house generation failed (HTTP ${res.status})`);
    }

    return await res.json();
  },

  async critiqueDesign(params: {
    designImage: string;
    question?: string;
  }): Promise<import('../types').DesignCritiqueResult> {
    const res = await fetch('/api/ai/design-critique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Design critique failed (HTTP ${res.status})`);
    }

    return await res.json();
  },

  async generateHouseImage(params: {
    prompt: string;
    style?: string;
    angle?: string;
  }): Promise<{ success: boolean; imageUrl: string; prompt: string; angle?: string }> {
    const res = await fetch('/api/ai/dream-house/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Image generation failed (HTTP ${res.status})`);
    }

    return await res.json();
  },
};

