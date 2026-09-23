import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FFT_SIZE,
  IDLE_BANDS,
  LERP_FACTOR,
  SMOOTHING_TIME_CONSTANT,
  bandAverages,
  smoothBands,
  type SpectrumBands,
} from './spectrum';
import { publishBands } from './audioBus';

export interface AudioEngineApi {
  fileName: string | null;
  isPlaying: boolean;
  error: string | null;
  spectrum: SpectrumBands;
  loadFile: (file: File) => void;
  loadUrl: (url: string, name: string) => void;
  toggle: () => Promise<void>;
  getSpectrum: () => SpectrumBands;
}

const CONSOLE_LOG_INTERVAL_MS = 600;

export function useAudioEngine(): AudioEngineApi {
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const elementRef = useRef<HTMLAudioElement | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const bandsRef = useRef<SpectrumBands>({ ...IDLE_BANDS });
  const urlRef = useRef<string | null>(null);
  const lastLogRef = useRef(0);

  const [fileName, setFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spectrum, setSpectrum] = useState<SpectrumBands>({ ...IDLE_BANDS });

  const ensureGraph = useCallback(() => {
    if (!elementRef.current) {
      const element = new Audio();
      element.crossOrigin = 'anonymous';
      element.preload = 'auto';
      elementRef.current = element;
    }

    if (!contextRef.current) {
      const Context =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Context) {
        throw new Error('Web Audio API is not supported in this browser.');
      }
      contextRef.current = new Context();
    }

    const context = contextRef.current;
    const element = elementRef.current;

    if (!analyserRef.current) {
      const analyser = context.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    if (!sourceRef.current) {
      sourceRef.current = context.createMediaElementSource(element);
      sourceRef.current.connect(analyserRef.current!);
      analyserRef.current!.connect(context.destination);
    }

    const onEnded = () => setIsPlaying(false);
    element.onended = onEnded;
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      try {
        setError(null);
        ensureGraph();

        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current);
        }

        const url = URL.createObjectURL(file);
        urlRef.current = url;
        elementRef.current!.src = url;
        elementRef.current!.play().then(
          () => setIsPlaying(true),
          () => setIsPlaying(false),
        );
        setFileName(file.name);
        void contextRef.current?.resume();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audio.');
      }
    },
    [ensureGraph],
  );

  const loadUrl = useCallback(
    (url: string, name: string) => {
      try {
        setError(null);
        ensureGraph();
        elementRef.current!.src = url;
        elementRef.current!.play().then(
          () => setIsPlaying(true),
          () => setIsPlaying(false),
        );
        setFileName(name);
        void contextRef.current?.resume();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audio.');
      }
    },
    [ensureGraph],
  );

  const toggle = useCallback(async () => {
    try {
      const element = elementRef.current;
      if (!element || !element.src) return;
      await contextRef.current?.resume();
      if (element.paused) {
        await element.play();
        setIsPlaying(true);
      } else {
        element.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playback failed.');
    }
  }, []);

  const getSpectrum = useCallback((): SpectrumBands => bandsRef.current, []);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const analyser = analyserRef.current;
      const data = dataRef.current;
      const context = contextRef.current;

      if (analyser && data && context) {
        analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
        const target = bandAverages(data, context.sampleRate, FFT_SIZE);
        bandsRef.current = smoothBands(bandsRef.current, target, LERP_FACTOR);
        publishBands(bandsRef.current);

        const now = performance.now();
        if (now - lastLogRef.current >= CONSOLE_LOG_INTERVAL_MS) {
          lastLogRef.current = now;
          const bands = bandsRef.current;
          setSpectrum({ ...bands });
          // Sprint 02 validation: spectrum visible in the console.
          console.log(
            `[audio] bass=${bands.bass.toFixed(2)} mids=${bands.mids.toFixed(2)} treble=${bands.treble.toFixed(2)}`,
          );
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      elementRef.current?.pause();
      elementRef.current = null;
      void contextRef.current?.close().catch(() => undefined);
      contextRef.current = null;
    },
    [],
  );

  return { fileName, isPlaying, error, spectrum, loadFile, loadUrl, toggle, getSpectrum };
}
