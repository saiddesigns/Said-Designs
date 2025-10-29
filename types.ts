import React from 'react';

// FIX: Added 'prompt' property to base Preset, as it's used by all preset constants.
export interface Preset {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    prompt: string;
}

export interface IllustrationStylePreset extends Preset {}

// FIX: Removed 'metadata' property, which was unused. 'prompt' is now inherited from Preset.
export interface CameraPreset extends Preset {}

// FIX: Removed 'metadata' property, which was unused. 'prompt' is now inherited from Preset.
export interface LightingPreset extends Preset {}

export interface MockupPreset extends Preset {
    // no extra fields
}

export interface ManipulationPreset extends Preset {
    // no extra fields
}

export interface PeopleRetouchPreset extends Preset {
    // no extra fields
}

export interface RetouchPreset extends Preset {
    // no extra fields
}

// FIX: Added '4:3' and '3:4' to match values used in constants.tsx.
export type AspectRatio = '9:16' | '4:5' | '1:1' | '3:2' | '16:9' | '4:3' | '3:4';

export interface ExportSettings {
    aspectRatio: AspectRatio;
    transparent: boolean;
}

export interface ImageFile {
    file: File;
    base64: string;
    mimeType: string;
}

export interface GenerationParams {
    cameraPresets: CameraPreset[];
    lightingPresets: LightingPreset[];
    mockupPreset: MockupPreset;
    manipulationPresets: ManipulationPreset[];
    peopleRetouchPresets: PeopleRetouchPreset[];
    retouchPresets: RetouchPreset[];
    exportSettings: ExportSettings;
    customPrompt: string;
}

export type AppMode = 'design-kit' | 'creative-studio';
export type CreativeMode = 'illustrate' | 'retouch';
export type RetouchSubMode = 'smart' | 'environment';

export type LightDirection = 'Auto' | 'Left' | 'Right' | 'Top' | 'Back';
export type WbAndGrade = 'Auto' | 'Neutral' | 'Filmic' | 'Cinematic (Teal & Orange)' | 'Warm Interior' | 'Cool Night' | 'Monochrome' | 'Cross-Process';

export interface RetouchOptions {
    // Core Face Retouch
    smoothness: number;
    lightBalance: number;
    correctSkinTones: boolean;
    sharpen: boolean;
    removeBlemishes: boolean;
    
    // Artistic Effects
    backgroundBlur: number;
    hdrEffect: number;
    vintageFade: number;
    glossySkin: boolean;
    glossinessIntensity: number;

    // Environment Harmonization
    environmentHarmony: boolean;
    lightDirection: LightDirection;
    keyFillRatio: number; // slider 0-100
    shadowSoftness: number; // slider 0-100
    wbAndGrade: WbAndGrade;
    artistCommand: string;
}


export type UpscaleTarget = 'hd' | '4k';

export interface HistoryItem {
    id: string;
    // For images, 'generated' holds the result.
    generated: { base64: string; mimeType: string };
    source: ImageFile;
    prompt: string;
    mode: AppMode;
    creativeSubMode?: CreativeMode;
}

// FIX: Added GroundingSource and GroundingResult types for AI Search feature.
export interface GroundingSource {
    uri: string;
    title: string;
}

export interface GroundingResult {
    text: string;
    sources: GroundingSource[];
}

export interface PromptSuggestion {
    title: string;
    prompt: string;
}