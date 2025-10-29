
import React, { useState, useRef, useEffect } from 'react';
import { generateImageWithImagen, suggestPrompts, upscaleImage } from '../services/geminiService';
import { ExportSettings, ImageFile, UpscaleTarget } from '../types';
import ExportControls from './ExportControls';
import Loader from './Loader';
import ImageUploader from './ImageUploader';
import { PhotoIcon, SparklesIcon, DownloadIcon, ArrowsExpandIcon } from './Icons';

const GenerateImage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [exportSettings, setExportSettings] = useState<ExportSettings>({
        aspectRatio: '1:1',
        transparent: false,
    });
    const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
    
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isImageSuggesting, setIsImageSuggesting] = useState(false);
    const [isTextSuggesting, setIsTextSuggesting] = useState(false);

    const [generatedImage, setGeneratedImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isUpscaling, setIsUpscaling] = useState<false | UpscaleTarget>(false);
    const [isUpscaleMenuOpen, setIsUpscaleMenuOpen] = useState(false);
    const upscaleMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (upscaleMenuRef.current && !upscaleMenuRef.current.contains(event.target as Node)) {
                setIsUpscaleMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSuggestForImage = async (image: ImageFile) => {
        setIsImageSuggesting(true);
        setSuggestions([]);
        setError(null);
        try {
            const prompts = await suggestPrompts({ image });
            setSuggestions(prompts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get suggestions.');
        } finally {
            setIsImageSuggesting(false);
        }
    };
    
    const handleSuggestForText = async () => {
        setIsTextSuggesting(true);
        setSuggestions([]);
        setError(null);
        try {
            const prompts = await suggestPrompts({ basePrompt: prompt, image: referenceImage });
            setSuggestions(prompts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get suggestions.');
        } finally {
            setIsTextSuggesting(false);
        }
    };

    const handleImageChange = (image: ImageFile | null) => {
        setReferenceImage(image);
        if (image) {
            handleSuggestForImage(image);
        } else {
            setSuggestions([]);
        }
    };
    
    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const result = await generateImageWithImagen(prompt, exportSettings.aspectRatio);
            if (result) {
                setGeneratedImage(result);
            } else {
                setError('Failed to generate image. The model did not return an image.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
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
    }

    return (
        <div className="h-full flex flex-col lg:flex-row gap-8">
            {/* Controls */}
            <div className="w-full lg:w-1/3 xl:w-1/4 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col gap-6 h-fit lg:max-h-full">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><PhotoIcon className="w-7 h-7 text-cyan-400" /> Generate Image</h2>
                
                <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2 -mr-2">
                    <ImageUploader title="Reference Image (Optional)" description="Upload an image to get AI prompt ideas." onImageChange={handleImageChange} />
                    
                    {isImageSuggesting && (
                        <div className="flex items-center gap-2 text-sm text-cyan-300">
                             <div className="w-4 h-4 border-2 border-t-cyan-400 border-gray-400 rounded-full animate-spin"></div>
                             AI is brainstorming ideas...
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                        <label htmlFor="prompt" className="font-semibold text-gray-200">Prompt</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A robot holding a red skateboard."
                            className="w-full h-32 bg-black/20 border border-[var(--border-color)] rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-400 resize-none"
                        />
                         <button
                            onClick={handleSuggestForText}
                            disabled={isTextSuggesting}
                            className="w-full py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center bg-sky-600/50 text-sky-200 border border-sky-500/60 hover:bg-sky-500/60 hover:text-white disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isTextSuggesting ? 'Thinking...' : prompt || referenceImage ? 'Enhance Prompt' : 'Suggest Ideas'}
                            {isTextSuggesting && <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin ml-2"></div>}
                        </button>
                    </div>
                    
                    {suggestions.length > 0 && (
                         <div>
                            <h3 className="font-semibold text-gray-200 mb-2 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-cyan-400"/> AI Suggestions</h3>
                            <div className="flex flex-col gap-2">
                                {suggestions.map((p, i) => (
                                    <button key={i} onClick={() => { setPrompt(p); setSuggestions([]); }} className="text-left text-sm text-gray-300 bg-black/20 p-2 rounded-md border border-transparent hover:border-cyan-400 transition-colors">
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <ExportControls settings={exportSettings} setSettings={setExportSettings} hideTransparency={true} />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full py-3 px-4 text-lg font-bold rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] glow-on-hover bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/20 disabled:bg-gray-700/50 disabled:from-gray-700 disabled:to-gray-700/80 disabled:cursor-not-allowed disabled:text-gray-400 disabled:shadow-none"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                    {isLoading && <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin ml-2"></div>}
                </button>
            </div>
            
            {/* Image Viewer */}
            <div className="flex-grow flex flex-col gap-4">
                <div className="flex-grow bg-black/20 border border-[var(--border-color)] rounded-xl flex items-center justify-center p-4 relative min-h-[300px] lg:min-h-0">
                    {isLoading && <Loader>
                        <p className="mt-4 text-lg font-semibold text-cyan-300">Generating your image...</p>
                        <p className="text-sm text-gray-200">This can take a moment.</p>
                    </Loader>}
                    {(error && !isLoading) && <div className="text-center text-red-400 p-4">{error}</div>}
                    {!generatedImage && !isLoading && !error && (
                         <div className="text-center text-gray-500">
                            <PhotoIcon className="w-24 h-24 mx-auto text-gray-700" />
                            <p className="mt-2 text-lg">Your generated image will appear here.</p>
                        </div>
                    )}
                    {generatedImage && !isLoading && (
                        <img src={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg" />
                    )}
                </div>
                {generatedImage && !isLoading && (
                    <div className="flex-shrink-0 flex gap-3">
                        <a 
                            href={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`} 
                            download="ai-generated-image.png"
                            className="w-full py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center bg-transparent text-gray-100 border border-white/50 hover:bg-white/10"
                        >
                            <DownloadIcon className="h-5 w-5 mr-2" /> Download
                        </a>
                        <div className="relative w-full" ref={upscaleMenuRef}>
                            <button
                                onClick={() => setIsUpscaleMenuOpen(prev => !prev)}
                                disabled={!!isUpscaling || isLoading}
                                className={`w-full py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center border ${
                                    !!isUpscaling || isLoading
                                    ? 'bg-gray-700/50 text-gray-400 border-transparent cursor-not-allowed'
                                    : 'bg-transparent text-gray-100 border-white/50 hover:bg-white/10'
                                }`}
                                title="Enhance image quality"
                            >
                                {isUpscaling === 'hd' ? 'Upscaling to HD...' : isUpscaling === '4k' ? 'Upscaling to 4K...' : 'Upscale'}
                                {isUpscaling 
                                    ? <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin ml-2"></div>
                                    : <ArrowsExpandIcon className="h-5 w-5 ml-2" />
                                }
                            </button>
                            {isUpscaleMenuOpen && (
                                    <div className="absolute bottom-full mb-2 w-full bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg z-10 p-1 space-y-1">
                                    <button
                                        onClick={() => handleUpscale('hd')}
                                        className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-200 rounded-md hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                                    >
                                        HD <span className="text-xs text-gray-400">(~2K)</span>
                                    </button>
                                    <button
                                        onClick={() => handleUpscale('4k')}
                                        className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-200 rounded-md hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                                    >
                                        4K <span className="text-xs text-gray-400">(~4K)</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateImage;
