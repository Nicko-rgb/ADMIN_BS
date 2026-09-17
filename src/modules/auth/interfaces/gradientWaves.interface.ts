export type GradientWavesDetail = 'low' | 'medium' | 'high';

export interface GradientWavesOptions {
    horizonColor?: string;
    waveColor?: string;
    crestColor?: string;
    speed?: number;
    amplitude?: number;
    waveScale?: number;
    waveRatio?: number;
    swell?: number;
    turbulence?: number;
    tilt?: number;
    zoom?: number;
    height?: number;
    fogDepth?: number;
    detail?: GradientWavesDetail;
    brightness?: number;
    opacity?: number;
    mouseInteraction?: boolean;
    parallaxStrength?: number;
    grain?: boolean;
    grainIntensity?: number;
}

export interface GradientWavesProps extends GradientWavesOptions {
    className?: string;
}
