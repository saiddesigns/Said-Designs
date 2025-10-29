import React, { useState } from 'react';
import { performSmartRetouch } from '../services/geminiService';
import { ImageFile, RetouchOptions } from '../types';
import ImageUploader from './ImageUploader';
import Loader from './Loader';
import { PencilIcon, PhotoIcon, SparklesIcon, WandIcon } from './Icons';
import BeforeAfterSlider from './BeforeAfterSlider';
import AccordionItem from './AccordionItem';

// Helper components for controls
const SliderControl: React.FC<{ label: string, value: number, onChange: (value: number) => void, min?: number, max?: number, disabled?: boolean, description?: string }> = 
({ label, value, onChange, min = 0, max = 100, disabled = false, description }) => (
    <div className={`space-y-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-200">{label}</label>
            <span className="text-sm font-semibold text-gray-100 w-10 text-right">{value}</span>
        </div>
        {description && <p className="text-xs text-gray-400">{description}</p>}
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={e => onChange(parseInt(e.target.value, 10))}
            className="w-full"
            disabled={disabled}
        />
    </div>
);

const ToggleControl: React.FC<{ label: string, checked: boolean, onChange: (checked: boolean) => void, description?: string }> = 
({ label, checked, onChange, description }) => (
    <div>
        <div className="flex items-center justify-between">
            <label className="text-sm text-gray-200 font-medium">{label}</label>
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                    checked ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={checked}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
);


const EditImage: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
    const [editedImage, setEditedImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [retouchOptions, setRetouchOptions] = useState<RetouchOptions>({
        smoothness: 50,
        lightBalance: 50,
        correctSkinTones: true,
        sharpen: true,
        removeBlemishes: true,
        backgroundBlur: 20,
        hdrEffect: 20,
        vintageFade: 10,
        glossySkin: false,
        glossinessIntensity: 25,
        // Unused by performSmartRetouch, but need to be in the object
        environmentHarmony: false,
        lightDirection: 'Auto',
        keyFillRatio: 50,
        shadowSoftness: 50,
        wbAndGrade: 'Auto',
        artistCommand: '',
    });
    
    const handleOptionChange = <K extends keyof RetouchOptions>(key: K, value: RetouchOptions[K]) => {
        setRetouchOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleRetouch = async () => {
        if (!sourceImage) {
            setError('Please upload a portrait image to retouch.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        try {
            const result = await performSmartRetouch(sourceImage, retouchOptions);
            if (result) {
                setEditedImage(result);
            } else {
                setError('Failed to retouch image. The model did not return an image.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImageChange = (image: ImageFile | null) => {
        setSourceImage(image);
        setEditedImage(null); // Clear previous edit when new image is uploaded
    }

    const sourceImageUrl = sourceImage ? `data:${sourceImage.mimeType};base64,${sourceImage.base64}` : null;
    const editedImageUrl = editedImage ? `data:${editedImage.mimeType};base64,${editedImage.base64}` : null;

    return (
        <div className="h-full flex flex-col lg:flex-row gap-8">
            {/* Controls */}
            <div className="w-full lg:w-[400px] xl:w-[450px] bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col gap-6 h-fit lg:max-h-full">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><PencilIcon className="w-7 h-7 text-cyan-400" /> Smart Retouch</h2>
                
                <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2 -mr-4 min-h-0">
                    <ImageUploader title="Source Portrait" description="Upload the portrait you want to retouch." onImageChange={handleImageChange} />
                    
                    <div className="space-y-2">
                        <AccordionItem title="Core Face Retouch" icon={<WandIcon className="w-6 h-6 text-cyan-400" />} isOpenDefault={true}>
                           <div className="space-y-4 p-2">
                                <SliderControl label="Skin Smoothness" value={retouchOptions.smoothness} onChange={v => handleOptionChange('smoothness', v)} description="Blends skin tones while preserving texture." />
                                <SliderControl label="Light Balance" value={retouchOptions.lightBalance} onChange={v => handleOptionChange('lightBalance', v)} description="Adjusts overall exposure and tonal balance." />
                                <ToggleControl label="Correct Skin Tones" checked={retouchOptions.correctSkinTones} onChange={v => handleOptionChange('correctSkinTones', v)} />
                                <ToggleControl label="Sharpen Details" checked={retouchOptions.sharpen} onChange={v => handleOptionChange('sharpen', v)} />
                                <ToggleControl label="Remove Blemishes" checked={retouchOptions.removeBlemishes} onChange={v => handleOptionChange('removeBlemishes', v)} />
                           </div>
                        </AccordionItem>
                        <AccordionItem title="Artistic Effects" icon={<SparklesIcon className="w-6 h-6 text-cyan-400" />} isOpenDefault={true}>
                             <div className="space-y-4 p-2">
                                <SliderControl label="Background Blur" value={retouchOptions.backgroundBlur} onChange={v => handleOptionChange('backgroundBlur', v)} description="Creates a depth-of-field effect." />
                                <SliderControl label="HDR Effect" value={retouchOptions.hdrEffect} onChange={v => handleOptionChange('hdrEffect', v)} description="Enhances detail in shadows and highlights." />
                                <SliderControl label="Vintage Fade" value={retouchOptions.vintageFade} onChange={v => handleOptionChange('vintageFade', v)} description="Adds a subtle film-like color fade." />
                                <ToggleControl label="Glossy Skin" checked={retouchOptions.glossySkin} onChange={v => handleOptionChange('glossySkin', v)} description="Adds a reflective sheen to skin highlights (cheekbones, nose bridge) for a polished, high-fashion look." />
                                <SliderControl label="Glossiness Intensity" value={retouchOptions.glossinessIntensity} onChange={v => handleOptionChange('glossinessIntensity', v)} disabled={!retouchOptions.glossySkin} description="Controls how intense the reflective sheen is. Higher values create a more dramatic 'wet' look." />
                             </div>
                        </AccordionItem>
                    </div>
                </div>

                <button
                    onClick={handleRetouch}
                    disabled={isLoading || !sourceImage}
                    className="w-full mt-auto py-3 px-4 text-lg font-bold rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] glow-on-hover bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/20 disabled:bg-gray-700/50 disabled:from-gray-700 disabled:to-gray-700/80 disabled:cursor-not-allowed disabled:text-gray-400 disabled:shadow-none"
                >
                    {isLoading ? 'Retouching...' : 'Retouch Image'}
                    {isLoading && <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin ml-2"></div>}
                </button>
            </div>
            
            {/* Image Viewer */}
            <div className="flex-grow bg-black/20 border border-[var(--border-color)] rounded-xl flex items-center justify-center p-4 relative min-h-[300px] lg:min-h-0">
                {isLoading && <Loader>
                    <p className="mt-4 text-lg font-semibold text-cyan-300">Applying your edits...</p>
                    <p className="text-sm text-gray-200">The AI is working its magic.</p>
                </Loader>}
                {error && !isLoading && <div className="text-center text-red-400 p-4">{error}</div>}
                {!sourceImage && !isLoading && !error && (
                     <div className="text-center text-gray-500">
                        <PhotoIcon className="w-24 h-24 mx-auto text-gray-700" />
                        <p className="mt-2 text-lg">Upload a portrait to start retouching.</p>
                    </div>
                )}
                {sourceImageUrl && !editedImageUrl && !isLoading && (
                    <img src={sourceImageUrl} alt="Source" className="max-w-full max-h-full object-contain rounded-lg" />
                )}
                {sourceImageUrl && editedImageUrl && !isLoading && (
                    <BeforeAfterSlider 
                        beforeSrc={sourceImageUrl}
                        afterSrc={editedImageUrl}
                    />
                )}
            </div>
        </div>
    );
};

export default EditImage;