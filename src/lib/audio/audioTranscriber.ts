import { Song, SongNote, DifficultyLevel } from '../songs/types';
import { LEAD_IN_SECONDS } from '../midi/midiParser';
import { MIN_MIDI, MAX_MIDI } from '../music';

export interface TranscribeProgressCallback {
  (percent: number, statusText: string): void;
}

/**
 * Calculates MIDI note frequency in Hz
 */
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Precompute target bin indices for all 88 piano keys (MIDI 21 to 108)
 */
function getPianoKeyFrequencies(): { midi: number; freq: number }[] {
  const keys: { midi: number; freq: number }[] = [];
  for (let m = MIN_MIDI; m <= MAX_MIDI; m++) {
    keys.push({ midi: m, freq: midiToFreq(m) });
  }
  return keys;
}

/**
 * Client-Side Audio-to-Piano Transcriber
 * Analyzes audio waveforms (MP3, WAV, OGG) using Web Audio API and STFT peak tracking,
 * outputting a structured Song object playable in Piano Art.
 */
export async function transcribeAudioToPiano(
  audioData: ArrayBuffer,
  fileName: string = 'Lagu Audio Kustom',
  onProgress?: TranscribeProgressCallback
): Promise<Song> {
  onProgress?.(10, 'Mendekode file audio...');

  // 1. Decode Audio Buffer via Web Audio API
  const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtxClass) {
    throw new Error('Web Audio API tidak didukung di browser ini.');
  }

  const audioCtx = new AudioCtxClass();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(audioData.slice(0));
  } catch (err) {
    await audioCtx.close();
    throw new Error('Gagal mendekode audio. Pastikan file adalah file audio valid (.mp3, .wav, .ogg).');
  }

  onProgress?.(25, 'Menganalisis frekuensi audio...');

  // 2. Downmix to Mono Channel
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  const totalSamples = audioBuffer.length;

  const monoData = new Float32Array(totalSamples);
  for (let c = 0; c < numChannels; c++) {
    const channelData = audioBuffer.getChannelData(c);
    const weight = 1 / numChannels;
    for (let i = 0; i < totalSamples; i++) {
      monoData[i] += channelData[i] * weight;
    }
  }

  // Cap analysis to 3.5 minutes (210s) to keep browser memory and responsiveness optimal
  const maxDurationSec = Math.min(210, audioBuffer.duration);
  const maxSamples = Math.floor(maxDurationSec * sampleRate);

  // 3. STFT Parameters
  const fftSize = 2048;
  const hopSize = Math.floor(sampleRate * 0.04); // 40ms hop size (~25 fps analysis)
  const numFrames = Math.floor((maxSamples - fftSize) / hopSize);

  if (numFrames <= 0) {
    await audioCtx.close();
    throw new Error('Durasi audio terlalu pendek untuk dianalisis.');
  }

  const pianoKeys = getPianoKeyFrequencies();

  // Precompute DFT bin indices and Hann window
  const hannWindow = new Float32Array(fftSize);
  for (let i = 0; i < fftSize; i++) {
    hannWindow[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  // Precompute bin indices for each piano key fundamental (f0) and first harmonic (2*f0)
  const keyBins = pianoKeys.map((k) => {
    const bin0 = Math.round((k.freq * fftSize) / sampleRate);
    const bin1 = Math.round(((k.freq * 2) * fftSize) / sampleRate);
    return {
      midi: k.midi,
      bin0: Math.min(fftSize / 2 - 1, Math.max(1, bin0)),
      bin1: Math.min(fftSize / 2 - 1, Math.max(1, bin1)),
    };
  });

  onProgress?.(45, 'Mendeteksi nada dan harmoni piano...');

  // 4. Extract Spectrogram Magnitude Frames
  const activeNotes: SongNote[] = [];
  const openNotes = new Map<number, { startTime: number; lastEnergy: number }>();

  // Moving average baseline to detect sharp onsets
  const baselineEnergy = new Float32Array(pianoKeys.length).fill(0.01);

  // Process frames in batches with small pauses to avoid freezing UI
  for (let frameIdx = 0; frameIdx < numFrames; frameIdx++) {
    if (frameIdx % 40 === 0 && onProgress) {
      const progressPercent = 45 + Math.round((frameIdx / numFrames) * 45);
      onProgress(progressPercent, `Menganalisis melodi (${Math.round((frameIdx / numFrames) * 100)}%)...`);
      // Yield to main thread briefly every 40 frames
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const frameStart = frameIdx * hopSize;
    const currentTimeSec = (frameStart / sampleRate) + LEAD_IN_SECONDS;

    // Apply Hann window and calculate power for piano bins
    // Using Goertzel/selective DFT for only target key bins for high speed
    const frameKeyEnergies: { midi: number; energy: number }[] = [];

    for (let k = 0; k < keyBins.length; k++) {
      const { midi, bin0, bin1 } = keyBins[k];
      const omega0 = (2 * Math.PI * bin0) / fftSize;
      const omega1 = (2 * Math.PI * bin1) / fftSize;

      let real0 = 0;
      let imag0 = 0;
      let real1 = 0;
      let imag1 = 0;

      // Sample a subset of points (stride 2) for rapid calculation
      for (let n = 0; n < fftSize; n += 2) {
        const val = monoData[frameStart + n] * hannWindow[n];
        real0 += val * Math.cos(omega0 * n);
        imag0 -= val * Math.sin(omega0 * n);
        real1 += val * Math.cos(omega1 * n);
        imag1 -= val * Math.sin(omega1 * n);
      }

      const mag0 = Math.sqrt(real0 * real0 + imag0 * imag0);
      const mag1 = Math.sqrt(real1 * real1 + imag1 * imag1);
      // Combine fundamental and harmonic
      const combinedEnergy = mag0 * 0.75 + mag1 * 0.35;

      frameKeyEnergies.push({ midi, energy: combinedEnergy });
    }

    // Sort by energy descending and pick top candidate peaks
    frameKeyEnergies.sort((a, b) => b.energy - a.energy);

    // Dynamic threshold: top peak * 0.4
    const topPeak = frameKeyEnergies[0]?.energy || 0;
    const threshold = Math.max(0.06, topPeak * 0.42);

    const activeMidisInFrame = new Set<number>();
    let notesAddedThisFrame = 0;

    for (let i = 0; i < frameKeyEnergies.length && notesAddedThisFrame < 4; i++) {
      const item = frameKeyEnergies[i];
      if (item.energy < threshold) break;

      const keyIdx = item.midi - MIN_MIDI;
      const prevBaseline = baselineEnergy[keyIdx];

      // Onset detection: sudden spike above baseline
      const isOnset = item.energy > prevBaseline * 1.6;

      if (isOnset || openNotes.has(item.midi)) {
        activeMidisInFrame.add(item.midi);
        notesAddedThisFrame++;

        if (!openNotes.has(item.midi)) {
          // New note triggered
          openNotes.set(item.midi, { startTime: currentTimeSec, lastEnergy: item.energy });
        } else {
          // Sustained note
          const existing = openNotes.get(item.midi)!;
          existing.lastEnergy = item.energy;
        }
      }

      // Update baseline tracker
      baselineEnergy[keyIdx] = prevBaseline * 0.85 + item.energy * 0.15;
    }

    // Check for ended notes
    openNotes.forEach((val, midi) => {
      if (!activeMidisInFrame.has(midi) || currentTimeSec - val.startTime > 2.0) {
        const dur = Math.max(0.12, currentTimeSec - val.startTime);
        activeNotes.push({
          midi,
          time: Math.round(val.startTime * 1000) / 1000,
          duration: Math.round(dur * 1000) / 1000,
          velocity: Math.min(1.0, Math.max(0.5, val.lastEnergy * 4)),
        });
        openNotes.delete(midi);
      }
    });
  }

  // Close remaining notes
  openNotes.forEach((val, midi) => {
    activeNotes.push({
      midi,
      time: Math.round(val.startTime * 1000) / 1000,
      duration: 0.35,
      velocity: 0.75,
    });
  });

  await audioCtx.close();

  onProgress?.(95, 'Menyelesaikan susunan partitur piano...');

  // 5. Post-process & Clean Note List
  activeNotes.sort((a, b) => a.time - b.time);

  if (activeNotes.length === 0) {
    throw new Error('Tidak terdeteksi nada piano yang cukup jelas dalam audio.');
  }

  const lastNote = activeNotes[activeNotes.length - 1];
  const totalDuration = Math.ceil(lastNote.time + lastNote.duration + 3);

  // Compute difficulty based on notes/sec
  const effectivePlayDuration = Math.max(5, totalDuration - LEAD_IN_SECONDS);
  const nps = activeNotes.length / effectivePlayDuration;

  let difficulty: DifficultyLevel = 'Normal';
  let stars = 2;
  if (nps < 2.0) {
    difficulty = 'Easy';
    stars = 1;
  } else if (nps <= 4.0) {
    difficulty = 'Normal';
    stars = 2;
  } else if (nps <= 6.5) {
    difficulty = 'Hard';
    stars = 3;
  } else {
    difficulty = 'Expert';
    stars = 5;
  }

  // Compute optimal suggested octave range
  let minNoteMidi = 108;
  let maxNoteMidi = 21;
  for (let i = 0; i < activeNotes.length; i++) {
    if (activeNotes[i].midi < minNoteMidi) minNoteMidi = activeNotes[i].midi;
    if (activeNotes[i].midi > maxNoteMidi) maxNoteMidi = activeNotes[i].midi;
  }
  const minOct = Math.max(0, Math.floor(minNoteMidi / 12) - 1);
  const maxOct = Math.min(8, Math.floor(maxNoteMidi / 12) - 1);
  const suggestedOctaves = Math.min(5, Math.max(3, maxOct - minOct + 1));
  const suggestedStartOctave = Math.min(8 - suggestedOctaves, Math.max(1, minOct));

  const cleanTitle = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]/g, ' ')
    .trim();

  const song: Song = {
    id: `custom-audio-${Date.now()}`,
    title: cleanTitle || 'Transkripsi Audio Piano',
    artist: 'Impor Audio AI',
    difficulty,
    bpm: 120,
    duration: totalDuration,
    suggestedOctaves,
    suggestedStartOctave,
    notes: activeNotes,
    stars,
    description: `Dikonversi otomatis dari audio ${fileName}. Berisi ${activeNotes.length} not piano terdeteksi.`,
  };

  onProgress?.(100, 'Selesai!');
  return song;
}
