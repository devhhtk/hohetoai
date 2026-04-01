/**
 * Aumage — Audio Feature Extraction
 *
 * Phase 1: Server-side FFT via /api/extract (authoritative, HMAC-signed)
 * Fallback: Client-side Meyda.js extraction (UX preview only, no authority)
 *
 * The server signal is what matters. Client-side is for waveform display only.
 */

const AumageExtractor = {

  PIPELINE_URL: 'https://hohetai-api.devhhtk.workers.dev',

  // ─────────────────────────────────────────────────────────────
  // PRIMARY: Server-side extraction + HMAC signature
  // ─────────────────────────────────────────────────────────────

  async extract(audioBlob) {
    const [serverResult, clientResult] = await Promise.allSettled([
      this._extractServer(audioBlob),
      this._extractClient(audioBlob),
    ]);

    const client = clientResult.status === 'fulfilled'
      ? clientResult.value
      : this._fallbackFeatures();

    if (serverResult.status === 'fulfilled' && serverResult.value?.signal) {
      const { signal, signature } = serverResult.value;
      console.log('[Extractor] Server ✓ | ARS:', signal.intelligence?.arsAdjusted, '| Trope:', signal.intelligence?.tropeSignal);
      return {
        _serverSignal: signal,
        _serverSignature: signature,
        _serverExtracted: true,
        ...this._mapServerToClient(signal, client),
        _clientFeatures: client,
      };
    }

    console.warn('[Extractor] Server failed — client fallback:', serverResult.reason?.message || 'unknown');
    return { ...client, _serverExtracted: false, _clientFeatures: client };
  },

  // ─────────────────────────────────────────────────────────────
  // SERVER EXTRACTION
  // ─────────────────────────────────────────────────────────────

  async _extractServer(audioBlob) {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const response = await fetch(this.PIPELINE_URL + '/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': audioBlob.type || 'audio/wav' },
      body: arrayBuffer,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Server extraction HTTP ' + response.status);
    }
    const result = await response.json();
    if (!result.signal || !result.signature) throw new Error('Incomplete server signal');
    return result;
  },

  // ─────────────────────────────────────────────────────────────
  // MAP SERVER SIGNAL → CLIENT FEATURE KEYS
  // So existing mapping/waveform code keeps working unchanged
  // ─────────────────────────────────────────────────────────────

  _mapServerToClient(signal, client) {
    const freq = signal.frequency || {};
    const time = signal.time || {};
    const intel = signal.intelligence || {};

    return {
      brightness: freq.brightness ?? client.brightness ?? 0.5,
      warmth: freq.warmth ?? client.warmth ?? 0.5,
      roughness: freq.roughness ?? client.roughness ?? 0.3,
      complexity: Math.min(1, (time.zeroCrossingRate || 0) * 15) || client.complexity || 0.5,
      intensity: Math.min(1, (time.rms || 0) * 2.5) || client.intensity || 0.5,
      harmonic_ratio: freq.harmonicRatio ?? client.harmonic_ratio ?? 0.5,
      timbre_complexity: freq.roughness ?? client.timbre_complexity ?? 0.3,
      spectral_centroid_mean: freq.spectralCentroid ?? client.spectral_centroid_mean ?? 2000,
      spectral_spread_mean: freq.spectralSpread ?? client.spectral_spread_mean ?? 1000,
      spectral_rolloff_mean: freq.spectralRolloff ?? client.spectral_rolloff_mean ?? 4000,
      spectral_flatness_mean: client.spectral_flatness_mean ?? 0.5,
      rms_mean: time.rms ?? client.rms_mean ?? 0.3,
      rms_max: time.peak ?? client.rms_max ?? 0.5,
      rms_std: client.rms_std ?? 0.1,
      dynamic_range: time.dynamicRange ?? client.dynamic_range ?? 0.5,
      energy_trajectory: client.energy_trajectory ?? 0,
      tempo: time.bpm ?? client.tempo ?? 100,
      zero_crossing_rate_mean: time.zeroCrossingRate ?? client.zero_crossing_rate_mean ?? 0.05,
      dominant_pitch_class: freq.dominantPitchClass ?? client.dominant_pitch_class ?? 0,
      chroma_mean: client.chroma_mean ?? new Array(12).fill(0),
      percussive_ratio: 1 - (freq.harmonicRatio ?? 0.5),
      mfcc_means: client.mfcc_means ?? new Array(13).fill(0),
      spectral_slope: client.spectral_slope ?? 0.5,
      rolloff: client.rolloff ?? 0.5,
      transient_strength: client.transient_strength ?? 0.5,
      steadiness: 1.0,
      duration_sec: time.duration ?? client.duration_sec ?? 3,
      sample_rate: client.sample_rate ?? 44100,
      _ars: intel.arsAdjusted ?? intel.ars ?? null,
    };
  },

  // ─────────────────────────────────────────────────────────────
  // CLIENT-SIDE EXTRACTION (Meyda.js) — waveform + display only
  // ─────────────────────────────────────────────────────────────

  async _extractClient(audioBlob) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;

      const bufferSize = 512;
      const hopSize = 512;
      const totalFrames = Math.floor(channelData.length / hopSize);

      const frames = {
        spectralCentroid: [], spectralFlatness: [], spectralRolloff: [],
        spectralSpread: [], spectralKurtosis: [], rms: [], zcr: [],
        mfcc: [], chroma: [], loudness: [], perceptualSpread: []
      };

      for (let i = 0; i < totalFrames; i++) {
        const start = i * hopSize;
        const frame = channelData.slice(start, start + bufferSize);
        if (frame.length < bufferSize) break;
        const signal = new Float32Array(bufferSize);
        signal.set(frame);
        const ex = Meyda.extract(
          ['spectralCentroid', 'spectralFlatness', 'spectralRolloff', 'spectralSpread',
            'spectralKurtosis', 'rms', 'zcr', 'mfcc', 'chroma', 'loudness', 'perceptualSpread'],
          signal
        );
        if (!ex) continue;
        frames.spectralCentroid.push(ex.spectralCentroid || 0);
        frames.spectralFlatness.push(ex.spectralFlatness || 0);
        frames.spectralRolloff.push(ex.spectralRolloff || 0);
        frames.spectralSpread.push(ex.spectralSpread || 0);
        frames.spectralKurtosis.push(ex.spectralKurtosis || 0);
        frames.rms.push(ex.rms || 0);
        frames.zcr.push(ex.zcr || 0);
        frames.loudness.push(ex.loudness?.total || 0);
        frames.perceptualSpread.push(ex.perceptualSpread || 0);
        if (ex.mfcc) frames.mfcc.push(ex.mfcc);
        if (ex.chroma) frames.chroma.push(ex.chroma);
      }

      audioCtx.close();
      return this._aggregate(frames, sampleRate, duration);
    } catch (e) {
      console.warn('[Extractor] Client extraction error:', e.message);
      return this._fallbackFeatures();
    }
  },

  _fallbackFeatures() {
    return {
      spectral_centroid_mean: 2000, spectral_flatness_mean: 0.3,
      spectral_rolloff_mean: 4000, spectral_spread_mean: 1000,
      rms_mean: 0.3, rms_max: 0.5, rms_std: 0.1, dynamic_range: 0.5,
      energy_trajectory: 0, tempo: 100, zero_crossing_rate_mean: 0.05,
      chroma_mean: new Array(12).fill(0), dominant_pitch_class: 0,
      harmonic_ratio: 0.5, percussive_ratio: 0.5,
      mfcc_means: new Array(13).fill(0),
      brightness: 0.5, warmth: 0.5, roughness: 0.3, complexity: 0.5,
      intensity: 0.5, timbre_complexity: 0.3, spectral_slope: 0.5,
      rolloff: 0.5, transient_strength: 0.5, steadiness: 1.0,
      duration_sec: 3, sample_rate: 44100, _serverExtracted: false,
    };
  },

  // ─────────────────────────────────────────────────────────────
  // CLIENT AGGREGATION (unchanged from original)
  // ─────────────────────────────────────────────────────────────

  _aggregate(frames, sampleRate, duration) {
    const mean = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const std = arr => { const m = mean(arr); return Math.sqrt(mean(arr.map(x => (x - m) ** 2))); };
    const max = arr => arr.length ? Math.max(...arr) : 0;
    const min = arr => arr.length ? Math.min(...arr) : 0;

    const spectralCentroidMean = mean(frames.spectralCentroid);
    const spectralFlatnessMean = mean(frames.spectralFlatness);
    const spectralRolloffMean = mean(frames.spectralRolloff);
    const spectralSpreadMean = mean(frames.spectralSpread);
    const rmsMean = mean(frames.rms);
    const rmsMax = max(frames.rms);
    const rmsStd = std(frames.rms);
    const dynamicRange = rmsMax - min(frames.rms);
    const third = Math.floor(frames.rms.length / 3);
    let energyTrajectory = 0;
    if (third > 0) {
      energyTrajectory = mean(frames.rms.slice(third * 2)) - mean(frames.rms.slice(0, third));
    }
    const zcrMean = mean(frames.zcr);

    let chromaMean = new Array(12).fill(0);
    let dominantPitchClass = 0;
    if (frames.chroma.length > 0) {
      for (const c of frames.chroma) { for (let i = 0; i < 12; i++) chromaMean[i] += c[i]; }
      chromaMean = chromaMean.map(v => v / frames.chroma.length);
      dominantPitchClass = chromaMean.indexOf(Math.max(...chromaMean));
    }

    let mfccMeans = new Array(13).fill(0);
    if (frames.mfcc.length > 0) {
      for (const m of frames.mfcc) { for (let i = 0; i < 13; i++) mfccMeans[i] += (m[i] || 0); }
      mfccMeans = mfccMeans.map(v => v / frames.mfcc.length);
    }

    const tempo = this._estimateTempo(frames.rms, duration);
    const percussiveness = (spectralFlatnessMean * 0.5) + (Math.min(zcrMean, 0.3) / 0.3 * 0.5);
    const harmonicRatio = Math.max(0, Math.min(1, 1 - percussiveness));
    const brightness = Math.min(1, spectralCentroidMean / 80);
    const warmth = 1 - brightness;
    const roughness = Math.min(1, zcrMean / 80);
    const complexity = Math.min(1, spectralSpreadMean / 60);
    const intensity = Math.min(1, rmsMean / 0.08);
    const mfccVariance = std(mfccMeans.slice(1));
    const timbreComplexity = Math.min(1, mfccVariance / 15);
    const mfcc1 = mfccMeans[1] || 0;
    const spectralSlope = Math.min(1, Math.max(0, (mfcc1 + 30) / 60));
    const rolloffNorm = Math.min(1, spectralRolloffMean / 160);
    const transientStrength = Math.min(1, rmsStd / 0.03);

    return {
      spectral_centroid_mean: spectralCentroidMean,
      spectral_flatness_mean: spectralFlatnessMean,
      spectral_rolloff_mean: spectralRolloffMean,
      spectral_spread_mean: spectralSpreadMean,
      rms_mean: rmsMean, rms_max: rmsMax, rms_std: rmsStd,
      dynamic_range: dynamicRange, energy_trajectory: energyTrajectory,
      tempo, zero_crossing_rate_mean: zcrMean,
      chroma_mean: chromaMean, dominant_pitch_class: dominantPitchClass,
      harmonic_ratio: harmonicRatio, percussive_ratio: 1 - harmonicRatio,
      mfcc_means: mfccMeans,
      brightness, warmth, roughness, complexity, intensity,
      timbre_complexity: timbreComplexity, spectral_slope: spectralSlope,
      rolloff: rolloffNorm, transient_strength: transientStrength, steadiness: 1.0,
      duration_sec: duration, sample_rate: sampleRate,
    };
  },

  _estimateTempo(rmsFrames, durationSec) {
    if (rmsFrames.length < 10) return 100;
    const rmsMean = rmsFrames.reduce((a, b) => a + b, 0) / rmsFrames.length;
    const threshold = rmsMean * 1.3;
    const onsets = [];
    for (let i = 1; i < rmsFrames.length; i++) {
      if (rmsFrames[i] > threshold && rmsFrames[i - 1] <= threshold) onsets.push(i);
    }
    if (onsets.length < 2) return 80;
    const intervals = [];
    for (let i = 1; i < onsets.length; i++) intervals.push(onsets[i] - onsets[i - 1]);
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const framesPerSecond = rmsFrames.length / durationSec;
    return Math.max(40, Math.min(220, 60 / (avgInterval / framesPerSecond)));
  }
};

window.AumageExtractor = AumageExtractor;
