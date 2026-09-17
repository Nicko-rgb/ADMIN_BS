import { useGradientWaves } from '../hooks/useGradientWaves';
import type { GradientWavesProps } from '../interfaces/gradientWaves.interface';
import '../styles/GradientWaves.css';

// Fondo animado WebGL de olas con degradado (React Bits).
export const GradientWaves = ({ className = '', ...options }: GradientWavesProps) => {
    const containerRef = useGradientWaves(options);

    return <div ref={containerRef} className={`gradient_waves ${className}`.trim()} />;
};
