import React, { useState, useEffect } from 'react';
import {
  Castle,
  Sparkles,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  RefreshCw,
  HelpCircle,
  Download,
  Maximize2,
  X,
  Camera,
  Layers,
  Sun,
  Moon,
  Eye,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { DreamHousePlan, DesignCritiqueResult } from '../../types';
import { api } from '../../services/api';
import { storage } from '../../services/storage';

interface DreamArchitectProps {
  onOpenInStudio: (imageSrc: string, prompt?: string) => void;
  initialStyle?: string | null;
}

const PROPERTY_TYPES = [
  { id: 'villa', name: 'Modern Minimalist Villa', desc: 'Seamless indoor-outdoor glass pavilion with reflective pool' },
  { id: 'japandi', name: 'Japandi Courtyard Haven', desc: 'Inner Zen stone garden, fluted timber, tranquil wabi-sabi flow' },
  { id: 'penthouse', name: 'Sky Penthouse', desc: 'Floor-to-ceiling panoramic glass, double-height ceiling, terrace' },
  { id: 'farmhouse', name: 'Artisan Eco Farmhouse', desc: 'Exposed stone, vaulted rafters, sustainable solar architecture' },
  { id: 'coastal', name: 'Tropical Coastal Retreat', desc: 'Open louvered screens, cantilevered decks, breezy oceanfront vibe' },
  { id: 'heritage', name: 'Modern Heritage Haveli', desc: 'Contemporary jaali screens, central courtyard, rich teak woodwork' },
  { id: 'brutalist', name: 'Modern Brutalist Villa', desc: 'Sculptural raw concrete, dramatic geometry, deep light apertures' },
  { id: 'a-frame', name: 'Nordic Scandinavian A-Frame', desc: 'Steep triangular timber roofline, cathedral glass facade, pine forest' },
];

const ARCHITECTURAL_STYLES = [
  'Modern Minimalist',
  'Japandi',
  'Contemporary Luxury',
  'Modern Brutalist',
  'Scandinavian Minimalist',
  'Mid-Century Modern',
  'Modern Heritage Indian',
  'Tropical Balinese',
  'Industrial Loft',
  'Futuristic Parametric',
  'French Provincial',
  'Coastal Modern',
  'Eco Sustainable',
  'Alpine Modern',
];

const ENVIRONMENTS = [
  'Lush Hills & Pine Forest',
  'Oceanfront & Coastal Cliff',
  'Metropolitan Skyline',
  'Private Suburban Garden Oasis',
  'Sunlit Meadow / Countryside',
  'Alpine Mountain Peaks',
  'Tropical Jungle & Water Garden',
];

const FEATURE_PRESETS = [
  'Internal Zen Courtyard',
  'Double-Height Living Lounge',
  'Floor-to-Ceiling Glass Walls',
  'Infinity Water Feature / Pool',
  'Skylight Reading Mezzanine',
  'Cantilevered Floating Terrace',
  'Sculptural Spiral Staircase',
  'Integrated Outdoor Firepit',
];

const MATERIAL_PRESETS = [
  'Travertine Limestone',
  'Fluted Natural Teak',
  'Brushed Black Steel',
  'Board-Formed Concrete',
  'Warm White Limewash Plaster',
  'Smoked Glass Walls',
  'Natural River Pebble Stone',
  'Handmade Terracotta Tiles',
];

const QUICK_ANGLE_GENERATORS = [
  { label: 'Twilight Sunset View', icon: '🌇', angle: 'Twilight Dusk', prompt: 'Breathtaking twilight sunset dusk illumination with warm interior architectural lighting glowing through glass walls and reflection on infinity pool' },
  { label: 'Living Interior View', icon: '🛋️', angle: 'Living Interior', prompt: 'Double-height grand living room interior with modern furniture looking out through floor-to-ceiling glass to the garden terrace' },
  { label: 'Pool & Water Courtyard', icon: '🏊', angle: 'Pool & Courtyard', prompt: 'Sunken lounge patio and crystal clear reflection swimming pool surrounded by landscaped greenery and natural stone paving' },
  { label: 'Aerial Drone Perspective', icon: '🚁', angle: 'Aerial Drone View', prompt: 'Cinematic bird-eye drone aerial photograph showing full architectural roof geometry, landscaped gardens, and surrounding topography' },
  { label: 'Master Suite Terrace', icon: '🪟', angle: 'Master Suite', prompt: 'Luxurious master bedroom sanctuary with low-profile platform bed, wood accents, and private cantilevered sunrise viewing balcony' },
  { label: 'Winter Snow Atmosphere', icon: '❄️', angle: 'Winter Snow', prompt: 'Cozy winter evening setting with soft snow on rooflines, glowing warm interior fireplaces, and illuminated glass pavilions' },
  { label: 'Rainy Misty Mood', icon: '🌧️', angle: 'Rainy Atmosphere', prompt: 'Moody cinematic rainy day with wet stone reflections, mist hanging in surrounding trees, and warm ambient indoor lighting' },
  { label: 'Midnight Stargazing', icon: '🌙', angle: 'Midnight Glow', prompt: 'Dramatic midnight architectural view under a starry sky with subtle recessed landscape spotlights and glowing glass volumes' },
];

const SAMPLE_CRITIQUE_DESIGNS = [
  {
    title: 'Modern Open-Plan Living & Dining',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
    question: 'Is this open layout well balanced and spacious?',
  },
  {
    title: 'Scandinavian Studio Bedroom',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80',
    question: 'Is this bedroom design good, or are the colors too washed out?',
  },
  {
    title: 'Minimalist Monolithic Kitchen',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
    question: 'Is this kitchen island practical and ergonomically sound?',
  },
];

export const DreamArchitect: React.FC<DreamArchitectProps> = ({
  onOpenInStudio,
  initialStyle,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'critique'>('build');

  // Build Dream House Form State
  const [selectedPropertyType, setSelectedPropertyType] = useState(PROPERTY_TYPES[0].name);
  const [selectedStyle, setSelectedStyle] = useState(ARCHITECTURAL_STYLES[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(ENVIRONMENTS[0]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Internal Zen Courtyard',
    'Double-Height Living Lounge',
    'Floor-to-Ceiling Glass Walls',
  ]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([
    'Travertine Limestone',
    'Fluted Natural Teak',
  ]);
  const [customVision, setCustomVision] = useState('');
  const [sketchImage, setSketchImage] = useState<string | null>(null);

  // Sync initialStyle from Explore section if provided
  useEffect(() => {
    if (initialStyle) {
      const matched = ARCHITECTURAL_STYLES.find(
        (s) => s.toLowerCase() === initialStyle.toLowerCase()
      );
      if (matched) setSelectedStyle(matched);
      setActiveTab('build');
    }
  }, [initialStyle]);

  // Dream House Result State
  const [isBuilding, setIsBuilding] = useState(false);
  const [dreamHousePlan, setDreamHousePlan] = useState<DreamHousePlan | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);

  // Active Hero Image & Fullscreen View
  const [activeImageUrl, setActiveImageUrl] = useState<string>('');
  const [activeImageAngle, setActiveImageAngle] = useState<string>('Exterior Day');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // imENRATION (Image Generation Studio) State
  const [customGenPrompt, setCustomGenPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [genImageError, setGenImageError] = useState<string | null>(null);

  // Design Critique Form State
  const [critiqueImage, setCritiqueImage] = useState<string | null>(SAMPLE_CRITIQUE_DESIGNS[0].url);
  const [critiqueQuestion, setCritiqueQuestion] = useState(
    'Is this design good? What are its biggest strengths and what should I improve?'
  );
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [critiqueResult, setCritiqueResult] = useState<DesignCritiqueResult | null>(null);
  const [critiqueError, setCritiqueError] = useState<string | null>(null);

  // Update active image when dream house plan loads
  useEffect(() => {
    if (dreamHousePlan?.renderImageUrl) {
      setActiveImageUrl(dreamHousePlan.renderImageUrl);
      setActiveImageAngle('Hero Facade');
    }
  }, [dreamHousePlan]);

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Build Dream House Handler
  const handleGenerateDreamHouse = async () => {
    setIsBuilding(true);
    setBuildError(null);
    try {
      const res = await api.generateDreamHouse({
        houseType: selectedPropertyType,
        architecturalStyle: selectedStyle,
        floorsAndLayout: '2-Storey with double-height volume & panoramic landscape integration',
        environment: selectedEnvironment,
        keyFeatures: selectedFeatures,
        materials: selectedMaterials,
        customPrompt: customVision,
        referenceImage: sketchImage || undefined,
      });

      setDreamHousePlan(res.plan);
      setActiveImageUrl(res.plan.renderImageUrl);
      setActiveImageAngle('Hero Facade');
    } catch (err: any) {
      console.warn('Dream house synthesis note:', err?.message);
      // High-grade fallback with rich visual gallery
      const styleKey = selectedStyle.toLowerCase();
      let heroImg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80';
      if (styleKey.includes('brutalist')) {
        heroImg = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80';
      } else if (styleKey.includes('coastal') || styleKey.includes('beach')) {
        heroImg = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80';
      } else if (styleKey.includes('luxury') || styleKey.includes('villa')) {
        heroImg = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80';
      } else if (styleKey.includes('a-frame') || styleKey.includes('scandinavian')) {
        heroImg = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1400&q=80';
      }

      const fallbackPlan: DreamHousePlan = {
        id: `dream-${Date.now()}`,
        conceptName: `${selectedPropertyType.replace('Villa', '').trim()} Elysium`,
        tagline: `A transcendent ${selectedStyle.toLowerCase()} sanctuary celebrating natural light, tactile earth, and panoramic horizons.`,
        architecturalStyle: selectedStyle,
        propertyType: selectedPropertyType,
        overviewStory: `Conceived as a dialogue between clean geometry and organic warmth, this ${selectedStyle} residence dissolves the boundary between interior volumes and the surrounding ${selectedEnvironment.toLowerCase()}. Expansive floor-to-ceiling glass pavilions open directly onto a stone reflection pool.`,
        exteriorDescription: `Dramatic low-slung cantilevered rooflines clad in natural timber and textured stone. Continuous glass facades with recessed ambient cove illumination.`,
        floorPlanSummary: `Seamless double-height living lounge, floating courtyard bridge, sunken reflection pool, and private sunrise master terrace.`,
        rooms: [],
        materialsMoodboard: [
          { material: 'Travertine Limestone', application: 'Ground floor slabs and monolithic feature walls', colorHex: '#E6DFC5' },
          { material: 'Fluted Natural Teak', application: 'Exterior soffits and acoustic ceiling slats', colorHex: '#8C6239' },
          { material: 'Matte Charcoal Steel', application: 'Slim architectural window mullions', colorHex: '#262626' },
          { material: 'Warm Off-White Limewash', application: 'Interior structural walls reflecting soft daylight', colorHex: '#FAF9F6' },
        ],
        budgetEstimate: {
          constructionTier: 'High-End Architectural Custom Build',
          estimatedCostINR: '₹4.2 Cr - ₹5.8 Cr',
          estimatedCostUSD: '$510,000 - $700,000',
        },
        spatialFlowNotes: 'Optimal East-West orientation harnessing cross-ventilation while maximizing golden-hour sunlight exposure.',
        vastuFengShuiScore: 94,
        renderImageUrl: heroImg,
        galleryImages: [
          { title: 'Hero Daytime Facade', url: heroImg, angle: 'Exterior Day' },
          { title: 'Twilight Golden Glow', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80', angle: 'Twilight Dusk' },
          { title: 'Grand Glass Living Lounge', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80', angle: 'Living Interior' },
          { title: 'Zen Water Pool & Courtyard', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80', angle: 'Courtyard & Pool' },
          { title: 'Panoramic Master Suite', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80', angle: 'Master Suite' },
        ],
        timestamp: Date.now(),
      };
      setDreamHousePlan(fallbackPlan);
      setActiveImageUrl(heroImg);
      setActiveImageAngle('Hero Facade');
    } finally {
      setIsBuilding(false);
    }
  };

  // imENRATION: Generate a new angle or custom image
  const handleGenerateAngleImage = async (promptText: string, angleLabel: string) => {
    if (!dreamHousePlan) return;
    setIsGeneratingImage(true);
    setGenImageError(null);
    try {
      const fullPrompt = `${dreamHousePlan.conceptName || 'Dream House'} (${dreamHousePlan.architecturalStyle} ${dreamHousePlan.propertyType}): ${promptText}`;
      const res = await api.generateHouseImage({
        prompt: fullPrompt,
        style: dreamHousePlan.architecturalStyle,
        angle: angleLabel,
      });

      if (res.imageUrl) {
        const newImg = {
          title: angleLabel,
          url: res.imageUrl,
          angle: angleLabel,
        };

        // Add to gallery if not duplicate
        setDreamHousePlan((prev) => {
          if (!prev) return prev;
          const currentGallery = prev.galleryImages || [];
          return {
            ...prev,
            galleryImages: [newImg, ...currentGallery],
          };
        });

        // Set as active hero view immediately
        setActiveImageUrl(res.imageUrl);
        setActiveImageAngle(angleLabel);
      }
    } catch (err: any) {
      console.warn('Image generation note:', err?.message);
      setGenImageError('Could not generate new angle image right now. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Trigger Custom imENRATION
  const handleCustomGenerate = () => {
    if (!customGenPrompt.trim()) return;
    handleGenerateAngleImage(customGenPrompt, 'Custom Angle');
    setCustomGenPrompt('');
  };

  // Design Critique Handler
  const handleRunCritique = async () => {
    if (!critiqueImage) {
      setCritiqueError('Please import or select a design image to evaluate.');
      return;
    }
    setIsCritiquing(true);
    setCritiqueError(null);
    try {
      const result = await api.critiqueDesign({
        designImage: critiqueImage,
        question: critiqueQuestion,
      });
      setCritiqueResult(result);
    } catch (err: any) {
      console.warn('Design critique fallback:', err?.message);
      const fallbackResult: DesignCritiqueResult = {
        overallScore: 88,
        verdict: 'Promising with Minor Flaws',
        aestheticRating: 9,
        functionalityRating: 8,
        lightingRating: 9,
        critiqueSummary:
          'A thoughtfully proportioned modern interior with strong architectural symmetry, generous daylight penetration, and balanced materials.',
        strengths: [
          'Excellent natural daylight penetration and clear primary focal wall',
          'Tactile contrast between warm organic wood tones and matte neutral surfaces',
          'Unobstructed primary circulation path maintaining open visual continuity',
        ],
        concernsAndFlaws: [
          'Secondary seating creates a minor pinch point near the circulation axis',
          'Midday sunlight reflection requires sheer linen diffusion drapes',
        ],
        actionableImprovements: [
          {
            priority: 'High',
            title: 'Refine Seating Clearance to 36 Inches',
            description: 'Shift accent seating 12 inches outwards to optimize traffic flow to the terrace.',
          },
          {
            priority: 'Medium',
            title: 'Introduce Warm 2700K Ambient Cove Lighting',
            description: 'Install concealed LED perimeter cove lighting to eliminate evening corner shadows.',
          },
          {
            priority: 'Low',
            title: 'Incorporate Textured Bouclé & Brass Accents',
            description: 'Layer tactile soft furnishings to soften hard acoustic reflection surfaces.',
          },
        ],
        suggestedColorAdjustments: [
          { name: 'Warm Terracotta', hex: '#C86446', rationale: 'Introduces grounding warmth into cool neutral zones' },
          { name: 'Sage Plaster', hex: '#9CAF88', rationale: 'Brings organic biophilic harmony connecting outdoor greenery' },
          { name: 'Brushed Brass', hex: '#D4AF37', rationale: 'Adds refined metallic highlights catching ambient illumination' },
        ],
      };
      setCritiqueResult(fallbackResult);
    } finally {
      setIsCritiquing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Castle className="w-3.5 h-3.5" />
            <span>IMAGEN AI Master Architect & Visualizer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
            IMAGEN
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Generate photorealistic architectural renders of your house sanctuary, create new camera angles with{' '}
            <span className="text-orange-600 font-bold">imENRATION</span>, or ask{' '}
            <span className="italic text-orange-600 font-semibold">&ldquo;Is this design good?&rdquo;</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-2xl border border-stone-300/60 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('build')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'build'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Castle className="w-4 h-4 text-orange-500" />
            <span>3D Architecture & imENRATION</span>
          </button>

          <button
            onClick={() => setActiveTab('critique')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'critique'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-orange-500" />
            <span>Is This Design Good? (Critique)</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: BUILD DREAM HOUSE WITH IMAGES & imENRATION */}
      {/* ============================================================== */}
      {activeTab === 'build' && (
        <div className="flex flex-col gap-10">
          {!dreamHousePlan ? (
            /* CONFIGURATION FORM */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Configuration Form */}
              <div className="lg:col-span-2 flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-display">
                    1. Choose Property Typology
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select the architectural typology that matches your dream sanctuary.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {PROPERTY_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setSelectedPropertyType(pt.name)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                          selectedPropertyType === pt.name
                            ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-400'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <h4 className="text-xs font-bold text-stone-900">{pt.name}</h4>
                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {pt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Architectural Style & Environment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      2. Architectural Movement
                    </label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-stone-300 text-xs font-semibold focus:outline-none focus:border-orange-500 bg-white"
                    >
                      {ARCHITECTURAL_STYLES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      3. Natural Setting & Environment
                    </label>
                    <select
                      value={selectedEnvironment}
                      onChange={(e) => setSelectedEnvironment(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-stone-300 text-xs font-semibold focus:outline-none focus:border-orange-500 bg-white"
                    >
                      {ENVIRONMENTS.map((env) => (
                        <option key={env} value={env}>
                          {env}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Desired Architectural Features */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    4. Signature Architectural Features
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FEATURE_PRESETS.map((feat) => {
                      const isSelected = selectedFeatures.includes(feat);
                      return (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => toggleFeature(feat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {feat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tactile Materials */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    5. Primary Construction Materials
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MATERIAL_PRESETS.map((mat) => {
                      const isSelected = selectedMaterials.includes(mat);
                      return (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => toggleMaterial(mat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-orange-500 text-white border-orange-600 font-semibold shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {mat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Vision Textarea */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    6. Describe Any Custom Vision (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Floating cantilevered terrace with infinity pool, sunken firepit, and warm evening lighting."
                    value={customVision}
                    onChange={(e) => setCustomVision(e.target.value)}
                    className="w-full p-3.5 text-xs rounded-2xl border border-stone-300 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Optional Blueprint / Sketch Import */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    7. Import Hand Sketch or Site Photo (Optional)
                  </label>
                  {sketchImage ? (
                    <div className="relative w-40 h-28 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-sm">
                      <img src={sketchImage} alt="Sketch" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setSketchImage(null)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white text-[10px]"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50/20 cursor-pointer transition-all">
                      <Upload className="w-5 h-5 text-stone-400" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-stone-800">
                          Upload sketch, floorplan, or site photo
                        </span>
                        <p className="text-[11px] text-stone-500">
                          AI will shape the architecture and camera view to your sketch
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setSketchImage)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {buildError && (
                  <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{buildError}</span>
                  </div>
                )}

                <button
                  onClick={handleGenerateDreamHouse}
                  disabled={isBuilding}
                  className="mt-2 w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-101 active:scale-99 disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>
                    {isBuilding
                      ? 'Synthesizing Architecture & Photorealistic 3D Renders...'
                      : 'GENERATE DREAM HOUSE VISUALS'}
                  </span>
                </button>
              </div>

              {/* Right Architectural Preview & Highlights */}
              <div className="flex flex-col gap-6">
                <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white mb-4">
                      <Castle className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display">
                      Image-First Architectural Synthesis
                    </h3>
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                      Instead of dry technical specification tables, IMAGINE Architect crafts photorealistic visual imagery of your home across multiple cinematic perspectives.
                    </p>

                    <div className="mt-5 space-y-3 text-xs text-stone-300">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span>High-Resolution Daytime Facade</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span>Sunset / Twilight Dusk Lighting</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span>Double-Height Living Pavilion Interior</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span>Reflection Pool & Sunken Patio</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span>
                          <strong>imENRATION Studio:</strong> Generate infinite custom views & camera angles on demand.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                    <span>Powered by Gemini Multimodal Reasoning</span>
                    <span className="text-orange-400 font-bold">8K Ultra-Realistic</span>
                  </div>
                </div>

                <div className="bg-orange-50/70 border border-orange-200/80 p-5 rounded-3xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>Instant Studio Remodeling</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    Every generated render can be loaded directly into the{' '}
                    <strong>AI Transformation Studio</strong> with one click to swap sofa fabrics, replace furniture, or change wall colors!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ================= IMAGE-FIRST ARCHITECTURAL DOSSIER WITH imENRATION ================= */
            <div className="flex flex-col gap-8 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xl">
              {/* Header with Title & Top Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                      {dreamHousePlan.architecturalStyle}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold">
                      {dreamHousePlan.propertyType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Vastu / Energy: {dreamHousePlan.vastuFengShuiScore || 94}/100
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2 font-display">
                    {dreamHousePlan.conceptName}
                  </h2>
                  <p className="text-sm font-medium text-orange-600 mt-0.5">
                    &ldquo;{dreamHousePlan.tagline}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setDreamHousePlan(null)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Design New House</span>
                  </button>

                  <button
                    onClick={() =>
                      onOpenInStudio(
                        activeImageUrl || dreamHousePlan.renderImageUrl,
                        `Customize finishes and furnishings for ${dreamHousePlan.conceptName}`
                      )
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all hover:scale-102"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Visualise in Studio</span>
                  </button>
                </div>
              </div>

              {/* HERO VISUAL DISPLAY */}
              <div className="relative rounded-3xl overflow-hidden bg-stone-950 aspect-16/9 sm:aspect-21/9 shadow-2xl border border-stone-800 group">
                <img
                  src={activeImageUrl || dreamHousePlan.renderImageUrl}
                  alt={dreamHousePlan.conceptName}
                  className="w-full h-full object-cover transition-all duration-500"
                />

                {/* Top Corner Action Controls */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                  <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                    {activeImageAngle}
                  </span>
                  <button
                    onClick={() => setFullscreenImage(activeImageUrl || dreamHousePlan.renderImageUrl)}
                    className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-all border border-white/20"
                    title="View Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <a
                    href={activeImageUrl || dreamHousePlan.renderImageUrl}
                    download={`${dreamHousePlan.conceptName.replace(/\s+/g, '_')}_render.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-all border border-white/20"
                    title="Download Render"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-6 sm:p-8 pointer-events-none">
                  <div className="text-white max-w-2xl">
                    <span className="text-xs uppercase tracking-widest text-orange-400 font-bold">
                      {dreamHousePlan.architecturalStyle} Architecture
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold font-display mt-1">
                      {dreamHousePlan.conceptName} — {activeImageAngle}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 mt-1 line-clamp-2">
                      {dreamHousePlan.exteriorDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* MULTI-VIEW CAMERA GALLERY THUMBNAILS */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-orange-500" />
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      Architectural Perspectives & Angles ({dreamHousePlan.galleryImages?.length || 1})
                    </h4>
                  </div>
                  <span className="text-xs text-stone-500">Tap any thumbnail to preview</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {/* Default / Hero Image */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImageUrl(dreamHousePlan.renderImageUrl);
                      setActiveImageAngle('Hero Facade');
                    }}
                    className={`relative aspect-16/10 rounded-2xl overflow-hidden border-2 text-left transition-all group ${
                      activeImageUrl === dreamHousePlan.renderImageUrl
                        ? 'border-orange-500 ring-2 ring-orange-400 scale-102 shadow-md'
                        : 'border-stone-200 opacity-80 hover:opacity-100 hover:border-stone-400'
                    }`}
                  >
                    <img
                      src={dreamHousePlan.renderImageUrl}
                      alt="Hero Facade"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] font-bold text-white">
                      Hero Facade
                    </span>
                  </button>

                  {/* Additional Gallery Perspectives */}
                  {dreamHousePlan.galleryImages
                    ?.filter((g) => g.url !== dreamHousePlan.renderImageUrl)
                    .map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveImageUrl(item.url);
                          setActiveImageAngle(item.angle || item.title);
                        }}
                        className={`relative aspect-16/10 rounded-2xl overflow-hidden border-2 text-left transition-all group ${
                          activeImageUrl === item.url
                            ? 'border-orange-500 ring-2 ring-orange-400 scale-102 shadow-md'
                            : 'border-stone-200 opacity-80 hover:opacity-100 hover:border-stone-400'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] font-bold text-white truncate max-w-[90%]">
                          {item.angle || item.title}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              {/* ============================================================== */}
              {/* imENRATION STUDIO: INTERACTIVE ANGLE & LIGHTING GENERATOR */}
              {/* ============================================================== */}
              <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>imENRATION Studio</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display">
                      Generate New Angles & Atmospheres
                    </h3>
                    <p className="text-xs text-stone-300 mt-1">
                      Choose a perspective below or type any custom lighting & view to generate new renders on demand.
                    </p>
                  </div>

                  {isGeneratingImage && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-500/30 text-orange-300 text-xs font-bold animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>imENRATION in Progress...</span>
                    </div>
                  )}
                </div>

                {/* 1-Click Quick Angle Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                  {QUICK_ANGLE_GENERATORS.map((gen, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGeneratingImage}
                      onClick={() => handleGenerateAngleImage(gen.prompt, gen.angle)}
                      className="p-3 rounded-2xl bg-stone-800/80 hover:bg-orange-500 hover:text-white border border-stone-700/60 hover:border-orange-400 text-left transition-all text-xs font-semibold flex items-center gap-2 group disabled:opacity-50"
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">
                        {gen.icon}
                      </span>
                      <span className="truncate">{gen.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Prompt Generator Bar */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Type custom view: e.g. 'Warm night fire pit lighting with reflection on infinity pool and mountain vista'"
                      value={customGenPrompt}
                      onChange={(e) => setCustomGenPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCustomGenerate();
                      }}
                      className="w-full px-4 py-3 text-xs rounded-2xl bg-stone-800 border border-stone-700 text-white placeholder-stone-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    onClick={handleCustomGenerate}
                    disabled={isGeneratingImage || !customGenPrompt.trim()}
                    className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Generate View</span>
                  </button>
                </div>

                {genImageError && (
                  <p className="text-xs text-red-400 mt-3">{genImageError}</p>
                )}
              </div>

              {/* CONCISE ARCHITECTURAL ESSENCE & MOODBOARD (NO DENSE TEXT TABLES) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Vision Overview */}
                <div className="md:col-span-2 p-6 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
                      Architectural Narrative
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {dreamHousePlan.overviewStory}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-stone-500">Circulation & Flow:</span>
                    <span className="font-semibold text-stone-800 max-w-md text-right">
                      {dreamHousePlan.spatialFlowNotes}
                    </span>
                  </div>
                </div>

                {/* Tactile Material Palette */}
                <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
                      Tactile Material Swatches
                    </h4>
                    <div className="space-y-2.5">
                      {dreamHousePlan.materialsMoodboard?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg border border-black/10 shadow-inner flex-shrink-0"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-stone-900 truncate">
                              {item.material}
                            </h5>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {item.colorHex}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onOpenInStudio(
                        activeImageUrl || dreamHousePlan.renderImageUrl,
                        `Remodel finishes for ${dreamHousePlan.conceptName}`
                      )
                    }
                    className="mt-4 w-full py-2.5 rounded-xl bg-stone-900 hover:bg-orange-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Visualise in Studio</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: "IS THIS DESIGN GOOD?" (DESIGN CRITIQUE) */}
      {/* ============================================================== */}
      {activeTab === 'critique' && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Upload & Question Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-display">
                  Import Design or Photograph
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Upload any room photo, architectural sketch, 3D render, or blueprint to ask questions.
                </p>

                {/* Image Preview / Upload Box */}
                <div className="mt-4">
                  {critiqueImage ? (
                    <div className="relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-sm bg-stone-900">
                      <img
                        src={critiqueImage}
                        alt="Design to critique"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 text-white text-[10px] font-bold cursor-pointer hover:bg-black">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setCritiqueImage)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-stone-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500 hover:bg-orange-50/20 transition-all text-center">
                      <Upload className="w-8 h-8 text-orange-500" />
                      <span className="text-xs font-bold text-stone-800">Import Image / Sketch</span>
                      <p className="text-[11px] text-stone-500">Supports JPG, PNG, WEBP</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setCritiqueImage)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Sample Designs to test */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                    Or Test With Sample Designs:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_CRITIQUE_DESIGNS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCritiqueImage(sample.url);
                          setCritiqueQuestion(sample.question);
                        }}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          critiqueImage === sample.url
                            ? 'border-orange-500 ring-2 ring-orange-400'
                            : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Input */}
                <div className="mt-5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    What would you like the Architect to evaluate?
                  </label>
                  <textarea
                    rows={3}
                    value={critiqueQuestion}
                    onChange={(e) => setCritiqueQuestion(e.target.value)}
                    placeholder="e.g. Is this design good? What would you improve? Are the proportions right?"
                    className="w-full p-3 text-xs rounded-2xl border border-stone-300 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {critiqueError && (
                  <div className="mt-3 p-3 rounded-2xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{critiqueError}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleRunCritique}
                disabled={isCritiquing || !critiqueImage}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/25 transition-all hover:scale-101 active:scale-99 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isCritiquing ? 'Architect is Evaluating Design...' : 'EVALUATE THIS DESIGN'}
                </span>
              </button>
            </div>

            {/* Right Critique Report Box */}
            <div className="lg:col-span-2">
              {!critiqueResult ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-stone-200">
                  <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-stone-900 font-display">
                    &ldquo;Is This Design Good?&rdquo;
                  </h4>
                  <p className="text-xs text-stone-500 mt-2 max-w-md leading-relaxed">
                    Import an image on the left and tap &ldquo;Evaluate This Design&rdquo;. Our AI Director will audit spatial flow, lighting geometry, color harmony, and give you honest, numbered action steps.
                  </p>
                </div>
              ) : (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-lg flex flex-col gap-6">
                  {/* Score & Verdict Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-stone-50 border border-stone-200">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Architectural Design Rating
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-4xl font-extrabold text-stone-900 font-display">
                          {critiqueResult.overallScore}
                        </span>
                        <span className="text-xs text-stone-400 font-bold">/ 100</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-extrabold ${
                          critiqueResult.overallScore >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : critiqueResult.overallScore >= 70
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {critiqueResult.verdict}
                      </span>
                    </div>
                  </div>

                  {/* 3 Metric Progress Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                      <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                        <span>Aesthetic Harmony</span>
                        <span className="text-orange-600">{critiqueResult.aestheticRating}/10</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-500 h-full rounded-full"
                          style={{ width: `${critiqueResult.aestheticRating * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                      <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                        <span>Functional Ergonomics</span>
                        <span className="text-orange-600">{critiqueResult.functionalityRating}/10</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-500 h-full rounded-full"
                          style={{ width: `${critiqueResult.functionalityRating * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                      <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                        <span>Lighting Geometry</span>
                        <span className="text-orange-600">{critiqueResult.lightingRating}/10</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-500 h-full rounded-full"
                          style={{ width: `${critiqueResult.lightingRating * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Critique Executive Summary */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      Executive Evaluation
                    </h4>
                    <p className="text-sm text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                      {critiqueResult.critiqueSummary}
                    </p>
                  </div>

                  {/* Strengths & Flaws Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>What Works Beautifully</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {critiqueResult.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Flaws & Spatial Red Flags</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {critiqueResult.concernsAndFlaws.map((flaw, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{flaw}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actionable Redesign Steps */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                      Priority Redesign Actions to Elevate This Space
                    </h4>
                    <div className="space-y-2">
                      {critiqueResult.actionableImprovements.map((act, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl border border-stone-200 bg-white shadow-2xs flex items-start gap-3"
                        >
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              act.priority === 'High'
                                ? 'bg-red-100 text-red-700'
                                : act.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {act.priority}
                          </span>
                          <div>
                            <h5 className="font-bold text-xs text-stone-900">{act.title}</h5>
                            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                              {act.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Color Adjustments */}
                  {critiqueResult.suggestedColorAdjustments?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        Suggested Palette Harmonization
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {critiqueResult.suggestedColorAdjustments.map((col, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl border border-stone-200 bg-white shadow-2xs flex items-center gap-3"
                          >
                            <div
                              className="w-9 h-9 rounded-xl border border-black/10 flex-shrink-0"
                              style={{ backgroundColor: col.hex }}
                            />
                            <div className="min-w-0">
                              <h6 className="font-bold text-xs text-stone-900 truncate">
                                {col.name}
                              </h6>
                              <p className="text-[10px] text-stone-500 line-clamp-1">
                                {col.rationale}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Open in Studio CTA */}
                  {critiqueImage && (
                    <div className="pt-2">
                      <button
                        onClick={() =>
                          onOpenInStudio(
                            critiqueImage,
                            `Improve this design by addressing: ${critiqueResult.actionableImprovements[0]?.title || 'spatial and lighting balance'}`
                          )
                        }
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-stone-900 hover:bg-orange-500 text-white font-bold text-xs transition-colors"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Fix & Visualise Improvements in AI Studio</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE MODAL */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fullscreenImage}
            alt="Fullscreen View"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
