import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import './PremiumAudioPlayer.css';

const PremiumAudioPlayer = ({ audioSrc, fallbackText, autoPlay = false, onPlaybackEnd }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(0);
  const [useTTS, setUseTTS] = useState(false);
  
  // Web Speech API refs
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const ttsTimer = useRef(null);
  const ttsProgress = useRef(0);

  useEffect(() => {
    // Stop any ongoing TTS
    if (synth) synth.cancel();
    if (ttsTimer.current) clearInterval(ttsTimer.current);

    // Reset UI state
    setIsPlaying(false);
    setProgress(0);
    setUseTTS(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [audioSrc]);

  useEffect(() => {
    if (autoPlay) {
      setTimeout(() => {
        togglePlay(true);
      }, 500);
    }
  }, [audioSrc, autoPlay]);

  const handleAudioError = () => {
    console.warn("Native MP3 failed (404/Network). Falling back to Offline TTS Engine.");
    setUseTTS(true);
  };

  const startTTS = () => {
    if (!synth || !fallbackText) return handleEnded();
    
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(fallbackText);
    utterance.lang = 'hi-IN'; // Hindi voice handles Sanskrit well
    utterance.rate = speed;
    utteranceRef.current = utterance;

    // Simulate progress since TTS doesn't give precise progress %
    ttsProgress.current = 0;
    const estimatedDurationInSecs = (fallbackText.length / 5) / speed; 
    setDuration(estimatedDurationInSecs);

    ttsTimer.current = setInterval(() => {
      ttsProgress.current += 0.5;
      const pct = Math.min((ttsProgress.current / estimatedDurationInSecs) * 100, 100);
      setProgress(pct);
    }, 500);

    utterance.onend = () => {
      clearInterval(ttsTimer.current);
      handleEnded();
    };

    utterance.onerror = () => {
      clearInterval(ttsTimer.current);
      handleEnded();
    };

    synth.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = (forcePlay = false) => {
    const shouldPlay = typeof forcePlay === 'boolean' ? forcePlay : !isPlaying;
    
    if (useTTS) {
      if (shouldPlay) {
        if (synth.paused) {
          synth.resume();
          setIsPlaying(true);
        } else {
          startTTS();
        }
      } else {
        synth.pause();
        setIsPlaying(false);
      }
    } else {
      if (shouldPlay) {
        const playPromise = audioRef.current?.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(e => {
            handleAudioError();
            setUseTTS(true);
            // Wait state update then play TTS
            setTimeout(startTTS, 100);
          });
        }
      } else {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !useTTS) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100 || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !useTTS) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newProgress = e.target.value;
    setProgress(newProgress);
    if (!useTTS && audioRef.current) {
      const seekTo = (newProgress / 100) * duration;
      audioRef.current.currentTime = seekTo;
    }
  };

  const changeSpeed = () => {
    let nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (useTTS) {
      if (utteranceRef.current) utteranceRef.current.rate = nextSpeed;
    } else if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (onPlaybackEnd) {
      onPlaybackEnd();
    }
  };

  return (
    <div className="premium-audio-player">
      {!useTTS && (
        <audio 
          ref={audioRef} 
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleAudioError}
        />
      )}
      
      <div className="player-controls">
        <button className="control-btn small-btn" onClick={() => {
          if (!useTTS && audioRef.current) {
             audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
          }
        }} aria-label="Rewind 10s">
          <RotateCcw size={20} />
        </button>

        <button className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`} onClick={() => togglePlay()} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>

        <button className="control-btn speed-btn" onClick={changeSpeed} aria-label="Change Speed">
          {speed}x
        </button>
      </div>

      <div className="progress-container">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress || 0} 
          onChange={handleSeek}
          className="progress-bar"
        />
        <div className="progress-fill" style={{ width: `${progress || 0}%` }}></div>
      </div>
      
      {useTTS && <div style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '-8px'}}>Offline TTS Mode Active</div>}
    </div>
  );
}

export default PremiumAudioPlayer;
