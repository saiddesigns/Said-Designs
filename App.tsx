
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import ImageViewer from './components/ImageViewer';
import ImageUploader from './components/ImageUploader';
import MagicCompositeToggle from './components/MagicCompositeToggle';
import GenerateImage from './components/GenerateImage';
import EditImage from './components/EditImage';
import SearchGrounding from './components/SearchGrounding';
import { generateImage, upscaleImage, analyzeForCompositeSuggestions, generateDesignKitPrompt } from './services/geminiService';
import { 
    ImageFile, 
    ExportSettings, 
    UpscaleTarget,
    CameraPreset, LightingPreset, MockupPreset, ManipulationPreset, RetouchPreset, PeopleRetouchPreset,
    GenerationParams,
    PromptSuggestion
} from './types';
import { 
    CAMERA_PRESETS, 
    LIGHTING_PRESETS, 
    MOCKUP_PRESETS, 
    MANIPULATION_PRESETS, 
    RETOUCH_PRESETS, 
    PEOPLE_RETOUCH_PRESETS 
} from './constants';
import { BehanceIcon, CubeTransparentIcon, FacebookIcon, InstagramIcon, MagnifyingGlassIcon, PencilIcon, PhotoIcon, SparklesIcon, WhatsAppIcon, WifiOffIcon } from './components/Icons';


const ProductStudio: React.FC = () => {
     // State management
     const [productImage, setProductImage] = useState<ImageFile | null>(null);
     const [environmentImage, setEnvironmentImage] = useState<ImageFile | null>(null);
     const [isMagicComposite, setIsMagicComposite] = useState(false);
     const [exportSettings, setExportSettings] = useState<ExportSettings>({ aspectRatio: '1:1', transparent: false });
     
     const [selectedCameras, setSelectedCameras] = useState<CameraPreset[]>([]);
     const [selectedLightings, setSelectedLightings] = useState<LightingPreset[]>([]);
     const [selectedMockups, setSelectedMockups] = useState<MockupPreset[]>([]);
     const [selectedManipulations, setSelectedManipulations] = useState<ManipulationPreset[]>([]);
     const [selectedRetouches, setSelectedRetouches] = useState<RetouchPreset[]>([]);
     const [selectedPeopleRetouches, setSelectedPeopleRetouches] = useState<PeopleRetouchPreset[]>([]);
     
     const [suggestedPresetIds, setSuggestedPresetIds] = useState<Record<string, string[]>>({});
 
     const [generatedImage, setGeneratedImage] = useState<{ base64: string; mimeType: string } | null>(null);
     
     // New states for creative brief & prompt suggestions
     const [customPrompt, setCustomPrompt] = useState('');
     const [promptSuggestions, setPromptSuggestions] = useState<PromptSuggestion[]>([]);
     const [isSuggestingPrompt, setIsSuggestingPrompt] = useState(false);

     // Loading and status states
     const [isAnalyzing, setIsAnalyzing] = useState(false);
     const [isLoading, setIsLoading] = useState(false);
     const [isUpscaling, setIsUpscaling] = useState<false | UpscaleTarget>(false);
     const [error, setError] = useState<string | null>(null);
     const [isOnline, setIsOnline] = useState(navigator.onLine);
     
     // Menu state
     const [isUpscaleMenuOpen, setIsUpscaleMenuOpen] = useState(false);
     const upscaleMenuRef = useRef<HTMLDivElement>(null);
 
     // Network status listener
     useEffect(() => {
         const handleOnline = () => setIsOnline(true);
         const handleOffline = () => setIsOnline(false);
         window.addEventListener('online', handleOnline);
         window.addEventListener('offline', handleOffline);
         return () => {
             window.removeEventListener('online', handleOnline);
             window.removeEventListener('offline', handleOffline);
         };
     }, []);
 
     // Upscale menu click outside handler
     useEffect(() => {
         const handleClickOutside = (event: MouseEvent) => {
             if (upscaleMenuRef.current && !upscaleMenuRef.current.contains(event.target as Node)) {
                 setIsUpscaleMenuOpen(false);
             }
         };
         document.addEventListener('mousedown', handleClickOutside);
         return () => document.removeEventListener('mousedown', handleClickOutside);
     }, []);
 
     const allPresetsMap = useMemo(() => ({
         camera: CAMERA_PRESETS,
         lighting: LIGHTING_PRESETS,
         mockup: MOCKUP_PRESETS,
         manipulation: MANIPULATION_PRESETS,
         retouch: RETOUCH_PRESETS,
         peopleRetouch: PEOPLE_RETOUCH_PRESETS,
     }), []);
 
     const stateSetters = useMemo(() => ({
         camera: setSelectedCameras,
         lighting: setSelectedLightings,
         mockup: setSelectedMockups,
         manipulation: setSelectedManipulations,
         retouch: setSelectedRetouches,
         peopleRetouch: setSelectedPeopleRetouches,
     }), []);
 
     const runMagicComposite = useCallback(async () => {
         if (!productImage || !environmentImage) return;
 
         setIsAnalyzing(true);
         setError(null);
         setSuggestedPresetIds({});
         
         // Clear previous manual selections
         Object.values(stateSetters).forEach(setter => setter([]));
 
         try {
             const suggestions = await analyzeForCompositeSuggestions(productImage, environmentImage);
             setSuggestedPresetIds(suggestions);
             
             // Apply suggestions
             for (const key in suggestions) {
                 const category = key as keyof typeof allPresetsMap;
                 const ids = suggestions[key];
                 const presetsToSelect = allPresetsMap[category].filter(p => ids.includes(p.id));
                 if (stateSetters[category]) {
                     stateSetters[category](presetsToSelect as any);
                 }
             }
 
         } catch (err) {
             setError(err instanceof Error ? err.message : 'AI analysis failed.');
             setIsMagicComposite(false); // Toggle off on error
         } finally {
             setIsAnalyzing(false);
         }
     }, [productImage, environmentImage, allPresetsMap, stateSetters]);
 
     useEffect(() => {
         if (isMagicComposite && productImage && environmentImage) {
             runMagicComposite();
         } else if (!isMagicComposite) {
             setSuggestedPresetIds({}); // Clear suggestions when toggled off
         }
     }, [isMagicComposite, productImage, environmentImage, runMagicComposite]);

     const handleSuggestPrompts = async () => {
        if (!productImage) return;
        setIsSuggestingPrompt(true);
        setError(null);
        setPromptSuggestions([]);
        try {
            const suggestions = await generateDesignKitPrompt(productImage, environmentImage);
            setPromptSuggestions(suggestions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get prompt suggestions.');
        } finally {
            setIsSuggestingPrompt(false);
        }
    };
 
     const handlePresetSelection = <T extends { id: string }>(
         preset: T,
         selected: T[],
         setter: React.Dispatch<React.SetStateAction<T[]>>
     ) => {
         const isSelected = selected.some(p => p.id === preset.id);
         if (isSelected) {
             setter(selected.filter(p => p.id !== preset.id));
         } else {
             setter([...selected, preset]);
         }
         // Disable magic composite on manual change
         if (isMagicComposite) setIsMagicComposite(false);
     };
 
     const handleGenerate = async () => {
         if (!productImage) {
             setError('Please upload a product image.');
             return;
         }
 
         setIsLoading(true);
         setError(null);
         setGeneratedImage(null);
 
         const params: GenerationParams = {
            cameraPresets: selectedCameras,
            lightingPresets: selectedLightings,
            mockupPreset: selectedMockups[0] || null, // The new service expects a single mockup
            manipulationPresets: selectedManipulations,
            retouchPresets: selectedRetouches,
            peopleRetouchPresets: selectedPeopleRetouches,
            exportSettings,
            customPrompt,
        };
 
         try {
             const result = await generateImage(productImage, environmentImage, isMagicComposite, params);
             if (result) {
                 setGeneratedImage(result);
             } else {
                 setError('The AI failed to generate an image.');
             }
         } catch (err) {
             setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
         } finally {
             setIsLoading(false);
         }
     };
     
     const handleUpscale = async (target: UpscaleTarget) => {
         if (!generatedImage) return;
         setIsUpscaleMenuOpen(false);
         setIsUpscaling(target);
         setError(null);
         try {
             const upscaled = await upscaleImage(generatedImage, target);
             if (upscaled) {
                 setGeneratedImage(upscaled);
             } else {
                 setError(`Failed to upscale to ${target}.`);
             }
         } catch(err) {
              setError(err instanceof Error ? err.message : 'An unknown error occurred during upscale.');
         } finally {
             setIsUpscaling(false);
         }
     };
     
     const canGenerate = useMemo(() => {
         return !!productImage && !isLoading && !isAnalyzing && isOnline;
     }, [productImage, isLoading, isAnalyzing, isOnline]);
 
     return (
        <div className="flex-grow flex flex-col lg:flex-row min-h-0 h-full">
            {/* Left Panel */}
            <aside className="w-full lg:w-[450px] xl:w-[500px] bg-[var(--panel-bg)] border-r border-[var(--border-color)] flex flex-col min-h-0 flex-shrink-0">
                <div className="p-4 space-y-4 border-b border-[var(--border-color)]">
                    <ImageUploader title="1. Upload Product Image" description="PNG with transparent background is best." onImageChange={setProductImage} />
                    <ImageUploader title="2. Upload Environment (Optional)" description="Add a background or scene for the AI to use." onImageChange={setEnvironmentImage} />
                    
                    {/* Creative Brief Section */}
                    <div className="space-y-2">
                        <label htmlFor="creative-brief" className="font-semibold text-gray-100 text-lg">3. Creative Brief (Optional)</label>
                        <textarea
                            id="creative-brief"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Describe the desired scene, mood, or style (e.g., 'A moody, cinematic shot for a perfume ad')."
                            className="w-full h-24 bg-black/20 border border-[var(--border-color)] rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-400 resize-none"
                        />
                        <button
                            onClick={handleSuggestPrompts}
                            disabled={!productImage || isSuggestingPrompt}
                            className="w-full py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center bg-sky-600/50 text-sky-200 border border-sky-500/60 hover:bg-sky-500/60 hover:text-white disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isSuggestingPrompt ? 'Thinking...' : 'Suggest Prompts'}
                            {isSuggestingPrompt && <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin ml-2"></div>}
                        </button>
                    </div>
                    
                    {promptSuggestions.length > 0 && (
                        <div className="space-y-2 animate-fade-in">
                            <h4 className="font-semibold text-gray-200 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-cyan-400"/> AI Suggestions:</h4>
                            {promptSuggestions.map((suggestion, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => { setCustomPrompt(suggestion.prompt); setPromptSuggestions([]); }} 
                                    className="w-full text-left text-sm text-gray-300 bg-black/20 p-3 rounded-md border border-transparent hover:border-cyan-400 transition-colors"
                                >
                                    <p className="font-bold text-cyan-300">{suggestion.title}</p>
                                    <p className="text-gray-300">{suggestion.prompt}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    <MagicCompositeToggle isEnabled={isMagicComposite} onToggle={setIsMagicComposite} />
                </div>
                
                <ControlPanel
                    selectedCameras={selectedCameras} onCameraSelect={(p) => handlePresetSelection(p, selectedCameras, setSelectedCameras as any)}
                    selectedLightings={selectedLightings} onLightingSelect={(p) => handlePresetSelection(p, selectedLightings, setSelectedLightings as any)}
                    selectedMockups={selectedMockups} onMockupSelect={(p) => handlePresetSelection(p, selectedMockups, setSelectedMockups as any)}
                    selectedManipulations={selectedManipulations} onManipulationSelect={(p) => handlePresetSelection(p, selectedManipulations, setSelectedManipulations as any)}
                    selectedRetouches={selectedRetouches} onRetouchSelect={(p) => handlePresetSelection(p, selectedRetouches, setSelectedRetouches as any)}
                    selectedPeopleRetouches={selectedPeopleRetouches} onPeopleRetouchSelect={(p) => handlePresetSelection(p, selectedPeopleRetouches, setSelectedPeopleRetouches as any)}
                    exportSettings={exportSettings} setExportSettings={setExportSettings}
                    referenceImage={productImage}
                    isAnalyzing={isAnalyzing}
                    suggestedPresetIds={suggestedPresetIds}
                    onGenerate={handleGenerate}
                    canGenerate={canGenerate}
                    isLoading={isLoading}
                    generatedImage={generatedImage}
                    isUpscaling={isUpscaling}
                    onUpscale={handleUpscale}
                    isOnline={isOnline}
                    upscaleMenuRef={upscaleMenuRef}
                    isUpscaleMenuOpen={isUpscaleMenuOpen}
                    setIsUpscaleMenuOpen={setIsUpscaleMenuOpen}
                />
            </aside>
            
            {/* Right Panel (Viewer) */}
            <div className="flex-grow flex flex-col min-h-0">
                {error && (
                    <div className="flex-shrink-0 bg-red-500/20 text-red-300 p-3 text-center text-sm font-medium">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                <ImageViewer 
                    productImage={productImage}
                    generatedImage={generatedImage}
                    isGenerating={isLoading || isAnalyzing}
                />
            </div>
        </div>
     )
}

const App: React.FC = () => {
    type Tool = 'studio' | 'generate' | 'edit' | 'search';
    const [activeTool, setActiveTool] = useState<Tool>('studio');
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'generate':
                return <GenerateImage />;
            case 'edit':
                return <EditImage />;
            case 'search':
                return <SearchGrounding />;
            case 'studio':
            default:
                return <ProductStudio />;
        }
    };
    
    const NavLink: React.FC<{tool: Tool, label: string, children: React.ReactNode}> = ({ tool, label, children }) => {
        const isActive = activeTool === tool;
        return (
            <button
                onClick={() => setActiveTool(tool)}
                className={`flex flex-col items-center justify-center gap-1 w-full p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                aria-label={label}
                title={label}
            >
                {children}
                <span className="text-xs font-semibold">{label}</span>
            </button>
        )
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#0d061c]">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--panel-bg)]/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <CubeTransparentIcon className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-xl font-bold text-white">SAID Designs Studio</h1>
                </div>
                {!isOnline && (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
                        <WifiOffIcon className="w-5 h-5"/> Offline Mode
                    </div>
                )}
            </header>
            
            <div className="flex-grow flex flex-col md:flex-row min-h-0">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-24 flex-shrink-0 bg-black/20 border-b md:border-b-0 md:border-r border-[var(--border-color)] p-2">
                    <nav className="flex flex-row md:flex-col gap-2">
                        <NavLink tool="studio" label="Product Studio"><CubeTransparentIcon className="w-7 h-7" /></NavLink>
                        <NavLink tool="generate" label="Generate"><PhotoIcon className="w-7 h-7" /></NavLink>
                        <NavLink tool="edit" label="Edit"><PencilIcon className="w-7 h-7" /></NavLink>
                        <NavLink tool="search" label="Search"><MagnifyingGlassIcon className="w-7 h-7" /></NavLink>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-grow min-h-0 overflow-y-auto md:overflow-hidden p-4 sm:p-6 lg:p-8">
                  {renderActiveTool()}
                </main>
            </div>
            <footer className="flex-shrink-0 flex items-center justify-center gap-4 p-3 border-t border-[var(--border-color)] bg-black/30">
                <a href="#" className="text-gray-400 hover:text-white transition-colors animate-pulse-color-social" title="Facebook"><FacebookIcon className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors animate-pulse-color-social [animation-delay:0.2s]" title="Instagram"><InstagramIcon className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors animate-pulse-color-social [animation-delay:0.4s]" title="Behance"><BehanceIcon className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors animate-pulse-color-social [animation-delay:0.6s]" title="WhatsApp"><WhatsAppIcon className="w-6 h-6" /></a>
            </footer>
        </div>
    );
};

export default App;