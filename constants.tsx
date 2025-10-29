
import React from 'react';
import { AspectRatio, CameraPreset, LightingPreset, MockupPreset, ManipulationPreset, RetouchPreset, PeopleRetouchPreset } from './types';
import { CameraIcon, FilmIcon, SunIcon, CubeTransparentIcon, LayersIcon, SlashIcon, WandIcon, SparklesIcon, UserIcon, FaceSmileIcon } from './components/Icons';

export const EXPORT_ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
    { value: '1:1', label: 'Square' },
    { value: '9:16', label: 'Story / Mobile' },
    { value: '16:9', label: 'Landscape (HD)' },
    { value: '4:3', label: 'Photo' },
    { value: '3:4', label: 'Portrait' },
];

export const CAMERA_PRESETS: readonly CameraPreset[] = [
    {
      id: 'camera_dslr',
      name: 'DSLR Effect',
      description: 'Shallow depth of field, sharp focus, professional look.',
      prompt: 'DSLR, 85mm lens, f/1.8, high resolution, shallow depth of field, bokeh',
      icon: <CameraIcon className="w-6 h-6" />,
    },
    {
      id: 'camera_cinematic',
      name: 'Cinematic',
      description: 'Wide aspect ratio, dramatic lighting, film grain.',
      prompt: 'cinematic film still, anamorphic lens, film grain, epic lighting',
      icon: <FilmIcon className="w-6 h-6" />,
    },
];

export const LIGHTING_PRESETS: readonly LightingPreset[] = [
    {
      id: 'lighting_softbox',
      name: 'Studio Softbox',
      description: 'Even, diffused light, minimizes shadows.',
      prompt: 'professional studio lighting, softbox, evenly lit, diffused light',
      icon: <SunIcon className="w-6 h-6" />,
    },
    {
      id: 'lighting_golden_hour',
      name: 'Golden Hour',
      description: 'Warm, dramatic, long shadows.',
      prompt: 'golden hour lighting, warm dramatic light, long shadows',
      icon: <SunIcon className="w-6 h-6" />,
    },
];

export const MOCKUP_PRESETS: readonly MockupPreset[] = [
    {
        id: 'mockup_marble',
        name: 'On a Marble Surface',
        description: 'Elegant and clean, placed on a white marble slab.',
        prompt: 'product photography, on a white marble surface, elegant background',
        icon: <CubeTransparentIcon className="w-6 h-6" />,
    },
    {
        id: 'mockup_floating',
        name: 'Floating',
        description: 'Product floating mid-air with a subtle drop shadow.',
        prompt: 'product floating mid-air, with a subtle drop shadow, against a clean background',
        icon: <CubeTransparentIcon className="w-6 h-6" />,
    }
];

export const MANIPULATION_PRESETS: readonly ManipulationPreset[] = [
    {
        id: 'manipulation_surreal',
        name: 'Surreal Composition',
        description: 'Dreamlike and artistic scene.',
        prompt: 'surreal composition, dreamlike, artistic',
        icon: <LayersIcon className="w-6 h-6" />,
    },
    {
        id: 'manipulation_minimalist',
        name: 'Minimalist',
        description: 'Clean background, focused on the product.',
        prompt: 'minimalist, clean background, simple, single color background',
        icon: <SlashIcon className="w-6 h-6" />,
    }
];

export const RETOUCH_PRESETS: readonly RetouchPreset[] = [
    {
        id: 'retouch_enhance',
        name: 'Enhance Details',
        description: 'Sharpen textures and clarify details.',
        prompt: 'highly detailed, sharp focus, 4k, high resolution',
        icon: <SparklesIcon className="w-6 h-6" />,
    },
    {
        id: 'retouch_remove_imperfections',
        name: 'Remove Imperfections',
        description: 'Clean up dust, scratches, and minor flaws.',
        prompt: 'clean product, remove any scratches or dust, perfect condition',
        icon: <WandIcon className="w-6 h-6" />,
    }
];

export const PEOPLE_RETOUCH_PRESETS: readonly PeopleRetouchPreset[] = [
    {
        id: 'people_natural_skin',
        name: 'Natural Skin',
        description: 'Smooth skin while retaining natural texture.',
        prompt: 'natural skin texture, smooth skin, portrait retouching',
        icon: <FaceSmileIcon className="w-6 h-6" />,
    },
    {
        id: 'people_headshot',
        name: 'Professional Headshot',
        description: 'Corporate lighting and professional retouching.',
        prompt: 'professional headshot retouching, corporate lighting',
        icon: <UserIcon className="w-6 h-6" />,
    }
];