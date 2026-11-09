import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// High limits for base64 room photos and mask buffers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Utility to extract mimeType and base64 string from data URL or remote HTTP/HTTPS URL
 */
async function resolveImagePart(imageInput?: string): Promise<{ mimeType: string; data: string } | null> {
  if (!imageInput) return null;

  // 1. Data URL
  const dataMatches = imageInput.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataMatches) {
    return {
      mimeType: dataMatches[1],
      data: dataMatches[2].trim(),
    };
  }

  // 2. Remote HTTP/HTTPS URL (e.g. Unsplash sample rooms or retail product URLs)
  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    try {
      const resp = await fetch(imageInput);
      if (!resp.ok) {
        console.warn(`Failed to fetch remote image from ${imageInput}: ${resp.status}`);
        return null;
      }
      const contentType = resp.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await resp.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      return {
        mimeType: contentType.split(';')[0].trim(),
        data: base64Data,
      };
    } catch (err) {
      console.error(`Error resolving remote image URL (${imageInput}):`, err);
      return null;
    }
  }

  // 3. Raw Base64 string fallback
  const cleaned = imageInput.replace(/^data:[^;]+;base64,/, '').trim();
  if (cleaned.length > 20 && !cleaned.startsWith('http')) {
    return {
      mimeType: 'image/jpeg',
      data: cleaned,
    };
  }

  return null;
}

/**
 * Health check & status
 */
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: 'IMAGINE',
    tagline: 'See it. Place it. Love it.',
  });
});

/**
 * 1. AI Room Object Detection & Spatial Segmentation
 * Uses gemini-3.8-flash with structured JSON responseSchema
 * Detects: Furniture, Sofas, Chairs, Tables, Beds, Curtains, Windows, Doors, Walls, Flooring, Lighting, Rugs, Decor
 */
app.post('/api/ai/detect-objects', async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: 'Room image data is required' });
      return;
    }

    const resolvedImage = await resolveImagePart(image);
    if (!resolvedImage) {
      res.status(400).json({ error: 'Failed to parse or load room image' });
      return;
    }

    const prompt = `Analyze this room interior image with computer vision precision.
Detect all visible room elements, furniture, decor, and architectural features:
- Sofas, sectionals, armchairs, accent chairs, dining chairs, benches
- Coffee tables, dining tables, side tables, desks, nightstands
- Beds, headboards, wardrobes, dressers, shelving units, bookcases
- Curtains, blinds, drapes, windows, doors, entryways
- Walls (accent walls, main walls), ceilings, flooring (wood, tile, carpet, rug)
- Lighting fixtures (chandeliers, pendant lights, floor lamps, table lamps, wall sconces)
- Decorative objects (artwork, wall mirrors, plants, vases, cushions, throws, fireplace)

For each detected object:
1. Provide a unique ID (e.g., 'sofa-1', 'table-1', 'wall-main', 'curtains-window', 'rug-floor')
2. Category name (e.g., 'Sofa', 'Table', 'Wall', 'Flooring', 'Curtain', 'Lighting', 'Chair', 'Bed', 'Rug', 'Decor')
3. Label (e.g., 'Brown 3-Seater Leather Sofa', 'Oak Wood Coffee Table', 'Off-White Back Wall')
4. Normalized bounding box coordinates on a 0 to 1000 scale: [ymin, xmin, ymax, xmax] where (0,0) is top-left and (1000,1000) is bottom-right.
5. Current color, material, and estimated condition.
6. 3-4 creative transformation suggestions (e.g., 'Emerald green velvet with brass legs', 'Modern white Carrara marble', 'Light linen beige drapes').`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: resolvedImage.mimeType,
              data: resolvedImage.data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedObjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  label: { type: Type.STRING },
                  box2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: '[ymin, xmin, ymax, xmax] in 0-1000 coordinates',
                  },
                  currentColor: { type: Type.STRING },
                  currentMaterial: { type: Type.STRING },
                  suggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'category', 'label', 'box2d', 'suggestions'],
              },
            },
            roomSummary: {
              type: Type.OBJECT,
              properties: {
                detectedRoomType: { type: Type.STRING },
                currentStyle: { type: Type.STRING },
                lighting: { type: Type.STRING },
                colorPalette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['detectedRoomType', 'currentStyle', 'colorPalette'],
            },
          },
          required: ['detectedObjects', 'roomSummary'],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsedResult });
  } catch (err: any) {
    console.error('Error detecting objects:', err);
    res.status(500).json({
      error: err.message || 'Failed to detect room objects',
      details: err.toString(),
    });
  }
});

/**
 * 2. AI Transformation Studio Engine
 * Transforms selected object or room area preserving room perspective, lighting, and unselected areas.
 * Supports:
 * - Method A: Text-to-transformation
 * - Method B: Reference product image replacement
 * - Method C: Style & Material picker combination
 */
app.post('/api/ai/transform-room', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      roomImage,
      selectedObject,
      maskImage,
      transformationMethod, // 'text' | 'product' | 'picker'
      promptText,
      productImage, // optional reference image
      materials,    // array of materials (e.g. ['Velvet', 'Marble'])
      colors,       // array of colors (e.g. ['Emerald Green', 'Brass'])
      style,        // e.g. 'Japandi', 'Scandinavian', 'Modern Luxury'
      customNotes,
    } = req.body;

    if (!roomImage) {
      res.status(400).json({ error: 'Original room image is required' });
      return;
    }

    const parsedRoom = await resolveImagePart(roomImage);
    if (!parsedRoom) {
      res.status(400).json({ error: 'Failed to parse or load room image' });
      return;
    }

    const contentParts: any[] = [
      {
        inlineData: {
          mimeType: parsedRoom.mimeType,
          data: parsedRoom.data,
        },
      },
    ];

    if (maskImage) {
      const parsedMask = await resolveImagePart(maskImage);
      if (parsedMask) {
        contentParts.push({
          inlineData: {
            mimeType: parsedMask.mimeType,
            data: parsedMask.data,
          },
        });
      }
    }

    if (productImage) {
      const parsedProduct = await resolveImagePart(productImage);
      if (parsedProduct) {
        contentParts.push({
          inlineData: {
            mimeType: parsedProduct.mimeType,
            data: parsedProduct.data,
          },
        });
      }
    }

    // Compose rich inpainting & photorealistic modification instructions
    let detailInstructions = '';
    if (transformationMethod === 'product' && productImage) {
      detailInstructions = `METHOD: PRODUCT IMAGE REPLACEMENT. Replace the designated object (${selectedObject?.label || 'selected furniture/area'}) with the reference product shown in the attached product photograph.
Crucial requirements:
- Replicate the exact product shape, material texture, color hue, stitching/legs/hardware details from the product image.
- Seamlessly insert it into the room at the precise spatial position, matching the room's natural perspective, ambient sunlight, floor shadows, and camera angle.
- Keep every other element of the room (walls, floor, ceiling, surrounding furniture, windows) untouched and pristine.`;
    } else if (transformationMethod === 'picker') {
      detailInstructions = `METHOD: STYLE, COLOR & MATERIAL TRANSFORMATION.
Target Object: ${selectedObject?.label || 'Selected Room Element'}.
Apply:
- Desired Style: ${style || 'Contemporary Modern'}
- Selected Color(s): ${(colors || []).join(', ') || 'Custom Designer Palette'}
- Selected Material(s): ${(materials || []).join(', ') || 'Premium Texture'}
Additional specifications: ${customNotes || 'High-end interior design quality'}.
Ensure realistic reflections, specular highlights, fabric weave or material grain, and cast shadows consistent with the room's light source.`;
    } else {
      detailInstructions = `METHOD: TEXT-TO-TRANSFORMATION.
Target Object: ${selectedObject?.label || 'Selected Room Element'}.
User Request: "${promptText || 'Modernize this item'}".
Transform this specific object according to the description while preserving all unselected background, surrounding furniture, lighting ambiance, and room geometry with 100% architectural realism.`;
    }

    const editPrompt = `You are the core visual generation engine of IMAGINE (See it. Place it. Love it.).
Task: Photorealistic interior room modification and inpainting.

${detailInstructions}

CRITICAL ARCHITECTURAL RULES:
1. Photorealistic, architectural digest quality, 8k interior design render.
2. Maintain natural room lighting, reflections, ambient occlusions, contact shadows on the floor/wall.
3. Preserve the exact room structure, surrounding walls, architecture, and all unselected furniture elements.
4. Output must be a clear, high-resolution interior view showing the transformed room.`;

    contentParts.push({ text: editPrompt });

    let generatedImageUrl: string | null = null;
    let modelUsed = 'gemini-3.1-flash-lite-image';
    let generationNotes = '';

    // Attempt generation with image generation model gemini-3.1-flash-lite-image
    try {
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: contentParts,
        },
        config: {
          imageConfig: {
            aspectRatio: '4:3',
          },
        },
      });

      for (const part of imageResponse.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/jpeg';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          generationNotes += part.text + ' ';
        }
      }
    } catch (imageErr: any) {
      console.warn('Image generation model notice (checking fallback):', imageErr?.message);
    }

    // If image generation model is not accessible or returned text only, use gemini-3.8-flash
    // to provide detailed interior design rationale and return structured result
    let designerCritique: any = null;
    try {
      const critiqueResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: parsedRoom.mimeType,
                data: parsedRoom.data,
              },
            },
            {
              text: `Act as a master interior designer reviewing this transformation for IMAGINE:
Selected: ${selectedObject?.label || 'Object'}
Transformation: ${detailInstructions}

Provide a concise, professional designer evaluation in JSON:
1. "designTitle": Short catchy name (e.g. 'Emerald Velvet Statement Lounge', 'Scandinavian Marble Refresh')
2. "stylingRationale": 2-3 sentences explaining why this transformation enhances the room's aesthetics, light, and proportions.
3. "accentColors": 3 hex color codes that complement this change.
4. "suggestedAccessories": 3 matching decor items to pair with this change.
5. "estimatedCostTier": 'Budget-friendly' | 'Mid-range' | 'Luxury Designer'`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              designTitle: { type: Type.STRING },
              stylingRationale: { type: Type.STRING },
              accentColors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestedAccessories: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              estimatedCostTier: { type: Type.STRING },
            },
            required: ['designTitle', 'stylingRationale', 'accentColors', 'suggestedAccessories'],
          },
        },
      });
      designerCritique = JSON.parse(critiqueResponse.text || '{}');
    } catch (cErr) {
      console.error('Error generating critique:', cErr);
    }

    res.json({
      success: true,
      generatedImageUrl: generatedImageUrl, // If generated by gemini-3.1-flash-lite-image
      modelUsed,
      notes: generationNotes.trim(),
      designerCritique: designerCritique || {
        designTitle: `${selectedObject?.category || 'Decor'} Transformation`,
        stylingRationale: 'Clean modern elevation enhancing spatial light and material contrast.',
        accentColors: ['#E07A5F', '#3D405B', '#81B29A'],
        suggestedAccessories: ['Textured linen throw', 'Sculptural brass table lamp', 'Woven wool rug'],
        estimatedCostTier: 'Mid-range',
      },
    });
  } catch (err: any) {
    console.error('Error in transform-room:', err);
    res.status(500).json({
      error: err.message || 'Transformation failed',
      details: err.toString(),
    });
  }
});

/**
 * 3. Smart Room AI - Conversational Interior Design Assistant
 * Answers queries like:
 * - "Which sofa colour suits this room?"
 * - "Suggest a modern interior style."
 * - "What colour curtains should I try?"
 * - "How can I make this room look brighter?"
 * Analyzes the uploaded room image + conversation history.
 */
app.post('/api/ai/interior-assistant', async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomImage, message, history, roomContext } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const parts: any[] = [];

    if (roomImage) {
      const parsed = await resolveImagePart(roomImage);
      if (parsed) {
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.data,
          },
        });
      }
    }

    const systemContext = `You are IMAGINE's Lead Interior Design AI and Spatial Decor Specialist.
Platform Tagline: "See it. Place it. Love it."
You give hyper-specific, actionable interior design guidance tailored directly to the user's uploaded room image.
User Room Context: ${JSON.stringify(roomContext || {})}
Prior Conversation History: ${JSON.stringify(history || [])}

When responding:
1. Be warm, sophisticated, concise, and expert.
2. Directly answer the user's question with precise color names, materials, spatial arrangements, and lighting tips.
3. Provide 2-3 specific one-click transformation prompts they can test right now in IMAGINE's AI Transformation Studio (e.g., 'Change curtains to sheer ivory linen', 'Replace sofa with emerald green velvet sectional').
4. Include complementary Indian & global decor aesthetics when relevant (Scandinavian, Japandi, Modern Indian, Mid-Century Modern, Minimalist Luxury).`;

    parts.push({
      text: `${systemContext}\n\nUser Question: ${message}\n\nPlease reply with your expert interior designer advice and recommendations.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts,
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description: 'Conversational, markdown-formatted expert interior design reply with bullet points and clear sections.',
            },
            keyRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 concise takeaway recommendations',
            },
            suggestedTransformations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  objectCategory: { type: Type.STRING },
                  actionPrompt: { type: Type.STRING },
                },
                required: ['title', 'objectCategory', 'actionPrompt'],
              },
            },
            suggestedColorPalette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                },
                required: ['name', 'hex'],
              },
            },
          },
          required: ['replyText', 'keyRecommendations', 'suggestedTransformations'],
        },
      },
    });

    const assistantResult = JSON.parse(response.text || '{}');
    res.json({ success: true, ...assistantResult });
  } catch (err: any) {
    console.error('Error in interior-assistant:', err);
    res.status(500).json({
      error: err.message || 'Assistant failed to generate response',
      details: err.toString(),
    });
  }
});

/**
 * 4. Deep Room Spatial & Lighting Analysis
 */
app.post('/api/ai/analyze-room', async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomImage } = req.body;
    if (!roomImage) {
      res.status(400).json({ error: 'Room image required' });
      return;
    }

    const resolvedRoom = await resolveImagePart(roomImage);
    if (!resolvedRoom) {
      res.status(400).json({ error: 'Failed to parse or load room image' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: resolvedRoom.mimeType,
              data: resolvedRoom.data,
            },
          },
          {
            text: `Analyze this room comprehensively for interior renovation and decor upgrades:
1. Room Type (Living Room, Bedroom, Dining, Home Office, Kitchen, etc.)
2. Dominant Architectural Style & Era
3. Natural Light Level (Low, Moderate, Bright, Harsh) & Direction
4. Spatial Flow & Clutter Index (1 to 10 scale)
5. Color Harmony Score (1 to 10 scale)
6. Top 3 highest-impact upgrades to elevate this space.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roomType: { type: Type.STRING },
            style: { type: Type.STRING },
            naturalLight: { type: Type.STRING },
            spatialScore: { type: Type.INTEGER },
            colorHarmonyScore: { type: Type.INTEGER },
            highestImpactUpgrades: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['roomType', 'style', 'naturalLight', 'spatialScore', 'colorHarmonyScore', 'highestImpactUpgrades'],
        },
      },
    });

    const analysisResult = JSON.parse(response.text || '{}');
    res.json({ success: true, ...analysisResult });
  } catch (err: any) {
    console.error('Error in analyze-room:', err);
    res.status(500).json({ error: err.message || 'Room analysis failed' });
  }
});

/**
 * 5. AI Dream House Architect & Master Planner
 * Creates a complete architectural blueprint, room specifications, and photorealistic concept render
 */
app.post('/api/ai/dream-house/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      houseType = 'Modern Minimalist Villa',
      architecturalStyle = 'Japandi',
      floorsAndLayout = '2-Storey with double-height living & courtyard',
      environment = 'Lush Hills / Forest',
      keyFeatures = [],
      materials = [],
      customPrompt = '',
      referenceImage,
    } = req.body;

    const parts: any[] = [];

    if (referenceImage) {
      const resolvedRef = await resolveImagePart(referenceImage);
      if (resolvedRef) {
        parts.push({
          inlineData: {
            mimeType: resolvedRef.mimeType,
            data: resolvedRef.data,
          },
        });
      }
    }

    const architectPrompt = `You are IMAGINE's Chief Architectural Master Planner and Dream House Designer.
Design an extraordinary, buildable DREAM HOUSE according to these specifications:
- House/Property Type: ${houseType}
- Architectural Style: ${architecturalStyle}
- Spatial Layout: ${floorsAndLayout}
- Setting / Environment: ${environment}
- Desired Key Features: ${(keyFeatures || []).join(', ') || 'Floor-to-ceiling glass, private courtyard, water feature'}
- Primary Materials: ${(materials || []).join(', ') || 'Limestone, fluted oak, brushed black steel'}
- Client Custom Vision: "${customPrompt || 'Create a serene, timeless architectural sanctuary'}"

Provide an Architectural Master Plan Dossier in structured JSON format with:
1. conceptName: Catchy architectural project name (e.g. "Villa Sora", "The Obsidian Pavilion", "Elysian Hillside Sanctuary")
2. tagline: Inspiring 1-line architectural vision statement
3. architecturalStyle: The exact style
4. propertyType: The property type
5. overviewStory: 2-3 paragraphs describing the vision, spatial experience, transitions between inside and outside, and sensory details.
6. exteriorDescription: Exact materials, roofline, window geometry, facade lighting, and landscaping integration.
7. floorPlanSummary: Detailed circulation plan (Ground floor, First floor, outdoor zones).
8. rooms: Array of 4-5 major rooms (e.g. Double-Height Living Lounge, Gourmet Minimalist Kitchen, Master Suite Sanctuary, Spa Bath & Courtyard). Each with roomName, dimensions (e.g. "24' x 18' (432 sq ft)"), keyDesignElements (3 items), recommendedFurniture (3 items), and lightingDesign.
9. materialsMoodboard: 4 key tactile materials with material name, architectural application, and matching hex color code.
10. budgetEstimate: constructionTier (e.g. "Premium Luxury Custom Build"), estimatedCostINR (e.g. "₹3.8 Cr - ₹5.2 Cr"), estimatedCostUSD (e.g. "$460,000 - $630,000").
11. spatialFlowNotes: 2 sentences on natural ventilation, circulation, and daylight axis.
12. vastuFengShuiScore: Integer 1-100 evaluating positive natural energy flow and cardinal orientations.`;

    parts.push({ text: architectPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptName: { type: Type.STRING },
            tagline: { type: Type.STRING },
            architecturalStyle: { type: Type.STRING },
            propertyType: { type: Type.STRING },
            overviewStory: { type: Type.STRING },
            exteriorDescription: { type: Type.STRING },
            floorPlanSummary: { type: Type.STRING },
            rooms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  roomName: { type: Type.STRING },
                  dimensions: { type: Type.STRING },
                  keyDesignElements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recommendedFurniture: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  lightingDesign: { type: Type.STRING },
                },
                required: ['roomName', 'dimensions', 'keyDesignElements', 'recommendedFurniture', 'lightingDesign'],
              },
            },
            materialsMoodboard: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  material: { type: Type.STRING },
                  application: { type: Type.STRING },
                  colorHex: { type: Type.STRING },
                },
                required: ['material', 'application', 'colorHex'],
              },
            },
            budgetEstimate: {
              type: Type.OBJECT,
              properties: {
                constructionTier: { type: Type.STRING },
                estimatedCostINR: { type: Type.STRING },
                estimatedCostUSD: { type: Type.STRING },
              },
              required: ['constructionTier', 'estimatedCostINR', 'estimatedCostUSD'],
            },
            spatialFlowNotes: { type: Type.STRING },
            vastuFengShuiScore: { type: Type.INTEGER },
          },
          required: [
            'conceptName',
            'tagline',
            'architecturalStyle',
            'propertyType',
            'overviewStory',
            'exteriorDescription',
            'floorPlanSummary',
            'rooms',
            'materialsMoodboard',
            'budgetEstimate',
            'spatialFlowNotes',
            'vastuFengShuiScore',
          ],
        },
      },
    });

    const housePlan = JSON.parse(response.text || '{}');

    // Attempt generating photorealistic architectural render
    let renderImageUrl: string | null = null;
    try {
      const renderPrompt = `Architectural Digest photography of ${housePlan.conceptName || 'Dream House'}.
Style: ${architecturalStyle} ${houseType}. Setting: ${environment}.
Exterior facade with ${housePlan.exteriorDescription || 'dramatic glass walls, natural timber slats, warm evening cove lighting'}.
Shot with tilt-shift architectural lens, Golden hour natural sunlight, hyper-detailed landscaping, reflective infinity pool, 8k resolution.`;

      const imageResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: renderPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });

      for (const part of imageResponse.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/jpeg';
          renderImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (imgErr) {
      console.warn('Dream house image render notice (using architectural preset):', (imgErr as any)?.message);
    }

    // High quality curated architectural renders as fallback
    if (!renderImageUrl) {
      const styleKey = (architecturalStyle || '').toLowerCase();
      if (styleKey.includes('japandi') || styleKey.includes('zen')) {
        renderImageUrl = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80';
      } else if (styleKey.includes('villa') || styleKey.includes('luxury')) {
        renderImageUrl = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80';
      } else if (styleKey.includes('brutalist') || styleKey.includes('concrete')) {
        renderImageUrl = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80';
      } else if (styleKey.includes('coastal') || styleKey.includes('beach')) {
        renderImageUrl = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80';
      } else {
        renderImageUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80';
      }
    }

    // Determine style-matched architectural gallery images
    const styleKey = (architecturalStyle || '').toLowerCase();
    let galleryImages: Array<{ title: string; url: string; angle: string }> = [];

    if (styleKey.includes('japandi') || styleKey.includes('zen')) {
      galleryImages = [
        { title: 'Main Facade & Entry Garden', url: renderImageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80', angle: 'Exterior Day' },
        { title: 'Twilight Glow & Shoji Lanterns', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80', angle: 'Twilight Dusk' },
        { title: 'Double-Height Living Pavilion', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1400&q=80', angle: 'Living Interior' },
        { title: 'Inner Stone Zen Courtyard', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80', angle: 'Courtyard & Water' },
        { title: 'Master Tatami & Oak Suite', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80', angle: 'Master Suite' },
      ];
    } else if (styleKey.includes('brutalist') || styleKey.includes('concrete')) {
      galleryImages = [
        { title: 'Monolithic Concrete Facade', url: renderImageUrl || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80', angle: 'Exterior Day' },
        { title: 'Dramatic Dusk Cove Lights', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80', angle: 'Twilight Dusk' },
        { title: 'Raw Concrete Gallery Living', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80', angle: 'Living Interior' },
        { title: 'Sunken Granite Firepit & Pool', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80', angle: 'Courtyard & Pool' },
      ];
    } else {
      galleryImages = [
        { title: 'Hero Architectural Facade', url: renderImageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80', angle: 'Exterior Day' },
        { title: 'Sunset Golden Hour Glow', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80', angle: 'Twilight Dusk' },
        { title: 'Grand Glass Living Lounge', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80', angle: 'Living Interior' },
        { title: 'Infinity Pool & Glass Veranda', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80', angle: 'Pool & Patio' },
        { title: 'Panoramic Master Suite', url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1400&q=80', angle: 'Master Suite' },
      ];
    }

    res.json({
      success: true,
      plan: {
        id: `dream-${Date.now()}`,
        ...housePlan,
        renderImageUrl,
        galleryImages,
        timestamp: Date.now(),
      },
    });
  } catch (err: any) {
    console.error('Error in dream-house generate:', err);
    res.status(500).json({ error: err.message || 'Dream House generation failed' });
  }
});

/**
 * Endpoint for on-demand image generation / re-generation of house angles
 */
app.post('/api/ai/dream-house/generate-image', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, style = 'Modern', angle = 'Exterior Facade' } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    let generatedImageUrl: string | null = null;
    try {
      const renderPrompt = `Architectural Digest photography: ${prompt}. Style: ${style}. View: ${angle}. Ultra-realistic architectural photography, 8k resolution, cinematic composition, award-winning home design.`;
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: renderPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });

      for (const part of imageResponse.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/jpeg';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (e: any) {
      console.warn('Image generation model note:', e?.message);
    }

    if (!generatedImageUrl) {
      const p = prompt.toLowerCase();
      if (p.includes('dusk') || p.includes('sunset') || p.includes('night') || p.includes('twilight')) {
        generatedImageUrl = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80';
      } else if (p.includes('interior') || p.includes('living') || p.includes('lounge')) {
        generatedImageUrl = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80';
      } else if (p.includes('bedroom') || p.includes('bed')) {
        generatedImageUrl = 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80';
      } else if (p.includes('pool') || p.includes('courtyard') || p.includes('water')) {
        generatedImageUrl = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80';
      } else if (p.includes('kitchen')) {
        generatedImageUrl = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80';
      } else if (p.includes('brutalist') || p.includes('concrete')) {
        generatedImageUrl = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80';
      } else if (p.includes('japandi') || p.includes('zen')) {
        generatedImageUrl = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80';
      } else {
        generatedImageUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80';
      }
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      prompt,
      angle,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image generation failed' });
  }
});

/**
 * 6. "Is This Design Good?" - AI Design Critique & Blueprint Evaluator
 * Accepts imported images (floorplans, sketches, renders, photos) and provides honest architectural evaluation
 */
app.post('/api/ai/design-critique', async (req: Request, res: Response): Promise<void> => {
  try {
    const { designImage, question = 'Is this design good? What would you improve?' } = req.body;

    if (!designImage) {
      res.status(400).json({ error: 'Design image or blueprint is required' });
      return;
    }

    const resolved = await resolveImagePart(designImage);
    if (!resolved) {
      res.status(400).json({ error: 'Failed to parse design image' });
      return;
    }

    const critiquePrompt = `You are a world-renowned master architect and interior design director reviewing an imported design or room photograph.
The user is asking: "${question}"

Perform a thorough, honest, constructive architectural critique. Do not give shallow praise; provide actionable engineering and aesthetic wisdom.
Evaluate:
1. overallScore: Integer between 1 and 100.
2. verdict: 'Exceptional' | 'Promising with Minor Flaws' | 'Needs Spatial Realignment' | 'Visually Conflicted'
3. aestheticRating: 1 to 10 scale
4. functionalityRating: 1 to 10 scale (circulation, clearance, ergonomical flow)
5. lightingRating: 1 to 10 scale (natural sunlight balance, task lighting, shadows)
6. critiqueSummary: 2-3 sentences summing up the soul and execution of this design.
7. strengths: Array of 3-4 distinct strengths (proportions, texture pairing, focal points).
8. concernsAndFlaws: Array of 2-3 honest flaws or red flags (e.g. cluttered pathway, heavy visual weight, poor contrast, glare).
9. actionableImprovements: Array of 3 specific recommendations with priority ('High' | 'Medium' | 'Low'), title, and clear instructions.
10. suggestedColorAdjustments: Array of 3 complementary colors with name, hex, and architectural rationale.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: resolved.mimeType,
              data: resolved.data,
            },
          },
          { text: critiquePrompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            verdict: {
              type: Type.STRING,
              enum: ['Exceptional', 'Promising with Minor Flaws', 'Needs Spatial Realignment', 'Visually Conflicted'],
            },
            aestheticRating: { type: Type.INTEGER },
            functionalityRating: { type: Type.INTEGER },
            lightingRating: { type: Type.INTEGER },
            critiqueSummary: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            concernsAndFlaws: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            actionableImprovements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['priority', 'title', 'description'],
              },
            },
            suggestedColorAdjustments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['name', 'hex', 'rationale'],
              },
            },
          },
          required: [
            'overallScore',
            'verdict',
            'aestheticRating',
            'functionalityRating',
            'lightingRating',
            'critiqueSummary',
            'strengths',
            'concernsAndFlaws',
            'actionableImprovements',
            'suggestedColorAdjustments',
          ],
        },
      },
    });

    const critiqueResult = JSON.parse(response.text || '{}');
    res.json({ success: true, ...critiqueResult });
  } catch (err: any) {
    console.error('Error in design-critique:', err);
    res.status(500).json({ error: err.message || 'Design critique failed' });
  }
});

/**
 * Configure Vite middleware in dev or static files in production
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`✨ IMAGINE Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer();
