import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import type { GradientWavesOptions } from '../interfaces/gradientWaves.interface';
import { GRADIENT_WAVES_FRAGMENT, GRADIENT_WAVES_VERTEX, detailToSteps, hexToRgb } from '../utils/gradientWaves';

/**
 * Monta el canvas WebGL de GradientWaves dentro del contenedor, anima el shader
 * (pausado si no está visible) y sincroniza los uniforms con las opciones.
 */
export const useGradientWaves = ({
    horizonColor = '#5227FF',
    waveColor = '#FF9FFC',
    crestColor = '#FFFFFF',
    speed = 0.4,
    amplitude = 2.5,
    waveScale = 0.6,
    waveRatio = 0.9,
    swell = 35,
    turbulence = 20,
    tilt = 1.11,
    zoom = 1.0,
    height = 5.5,
    fogDepth = 15,
    detail = 'medium',
    brightness = 1.0,
    opacity = 1.0,
    mouseInteraction = true,
    parallaxStrength = 0.5,
    grain = true,
    grainIntensity = 0.05,
}: GradientWavesOptions) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const programRef = useRef<Program | null>(null);
    const enableMouseRef = useRef(mouseInteraction);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const renderer = new Renderer({
            webgl: 2,
            alpha: true,
            premultipliedAlpha: true,
            antialias: false,
            dpr: Math.min(window.devicePixelRatio || 1, 2),
        });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        const canvas = gl.canvas;
        container.appendChild(canvas);

        const program = new Program(gl, {
            vertex: GRADIENT_WAVES_VERTEX,
            fragment: GRADIENT_WAVES_FRAGMENT,
            uniforms: {
                iTime: { value: 0 },
                iResolution: { value: new Float32Array([1, 1]) },
                uSpeed: { value: 0 },
                uAmplitude: { value: 0 },
                uWaveScale: { value: 0 },
                uWaveRatio: { value: 0 },
                uSwell: { value: 0 },
                uTurbulence: { value: 0 },
                uTilt: { value: 0 },
                uZoom: { value: 1 },
                uHeight: { value: 0 },
                uFogDepth: { value: 0 },
                uSteps: { value: 0 },
                uBrightness: { value: 1 },
                uOpacity: { value: 0 },
                uGrain: { value: 0 },
                uGrainIntensity: { value: 0 },
                uMouse: { value: new Float32Array([0.5, 0.5]) },
                uParallax: { value: 0 },
                uEnableMouse: { value: false },
                uHorizonColor: { value: new Float32Array(3) },
                uWaveColor: { value: new Float32Array(3) },
                uCrestColor: { value: new Float32Array(3) },
            },
        });
        const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
        programRef.current = program;

        const setSize = () => {
            const rect = container.getBoundingClientRect();
            renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
            program.uniforms.iResolution.value[0] = gl.drawingBufferWidth;
            program.uniforms.iResolution.value[1] = gl.drawingBufferHeight;
            renderer.render({ scene: mesh });
        };

        const resizeObserver = new ResizeObserver(setSize);
        resizeObserver.observe(container);
        setSize();

        const currentMouse = [0.5, 0.5];
        const targetMouse = [0.5, 0.5];

        const onPointerMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            targetMouse[0] = (e.clientX - rect.left) / rect.width;
            targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
        };
        const onPointerLeave = () => {
            targetMouse[0] = 0.5;
            targetMouse[1] = 0.5;
        };
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerleave', onPointerLeave);

        let raf = 0;
        let isVisible = true;
        let isPageVisible = !document.hidden;
        const startedAt = performance.now();

        const loop = (time: number) => {
            program.uniforms.iTime.value = (time - startedAt) * 0.001;
            const targetX = enableMouseRef.current ? targetMouse[0] : 0.5;
            const targetY = enableMouseRef.current ? targetMouse[1] : 0.5;
            currentMouse[0] += 0.05 * (targetX - currentMouse[0]);
            currentMouse[1] += 0.05 * (targetY - currentMouse[1]);
            program.uniforms.uMouse.value[0] = currentMouse[0];
            program.uniforms.uMouse.value[1] = currentMouse[1];
            renderer.render({ scene: mesh });
            raf = requestAnimationFrame(loop);
        };

        const tryStart = () => {
            if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
        };
        const tryStop = () => {
            if (raf !== 0) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
        };

        const intersectionObserver = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible) tryStart();
            else tryStop();
        });
        intersectionObserver.observe(container);

        const onVisibilityChange = () => {
            isPageVisible = !document.hidden;
            if (isPageVisible) tryStart();
            else tryStop();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        tryStart();

        return () => {
            tryStop();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            document.removeEventListener('visibilitychange', onVisibilityChange);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerleave', onPointerLeave);
            programRef.current = null;
            canvas.remove();
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, []);

    useEffect(() => {
        const program = programRef.current;
        if (!program) return;
        const u = program.uniforms;

        enableMouseRef.current = mouseInteraction;

        u.uSpeed.value = speed;
        u.uAmplitude.value = amplitude;
        u.uWaveScale.value = waveScale;
        u.uWaveRatio.value = waveRatio;
        u.uSwell.value = swell;
        u.uTurbulence.value = turbulence;
        u.uTilt.value = tilt;
        u.uZoom.value = zoom;
        u.uHeight.value = height;
        u.uFogDepth.value = fogDepth;
        u.uSteps.value = detailToSteps(detail);
        u.uBrightness.value = brightness;
        u.uOpacity.value = opacity;
        u.uGrain.value = grain ? 1.0 : 0.0;
        u.uGrainIntensity.value = grainIntensity;
        u.uParallax.value = parallaxStrength;
        u.uEnableMouse.value = mouseInteraction;
        u.uHorizonColor.value.set(hexToRgb(horizonColor));
        u.uWaveColor.value.set(hexToRgb(waveColor));
        u.uCrestColor.value.set(hexToRgb(crestColor));
    }, [
        horizonColor, waveColor, crestColor, speed, amplitude, waveScale, waveRatio, swell, turbulence,
        tilt, zoom, height, fogDepth, detail, brightness, opacity, grain, grainIntensity, mouseInteraction, parallaxStrength,
    ]);

    return containerRef;
};
