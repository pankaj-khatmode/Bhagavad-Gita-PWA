import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookmarkCheck, ArrowLeft, ArrowRight, Home, Mic, MicOff, Waves, Share2, Type, Languages } from 'lucide-react';
import shloksData from '../data/shloks.json';
import PremiumAudioPlayer from './PremiumAudioPlayer';
import { getBookmarks, saveBookmark, removeBookmark, markShlokRead, getA11yPrefs, saveA11yPrefs } from '../services/storageManager';
import './ShlokViewer.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

const ShlokViewer = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const chapter = parseInt(query.get('chapter')) || 1;
  const shlokNumber = parseInt(query.get('shlok')) || 1;
  const [bookmarks, setBookmarks] = useState([]);
  const [isMeditationMode, setIsMeditationMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [a11y, setA11y] = useState({ fontSize: 'normal', showTransliteration: false });
  const [showA11yMenu, setShowA11yMenu] = useState(false);

  // Initialize and Track Progress
  useEffect(() => {
    markShlokRead(chapter, shlokNumber);
    getA11yPrefs().then(setA11y);
  }, [chapter, shlokNumber]);

  useEffect(() => {
    let recognition = null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (isListening && SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        if (transcript.includes('next')) {
          handleNext();
        } else if (transcript.includes('previous') || transcript.includes('back')) {
          handlePrev();
        }
      };
      try {
        recognition.start();
      } catch (err) {
        console.error("Speech reco start error", err);
      }
    }
    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening, chapter, shlokNumber]);

  // Find current shlok
  const currentShlokIndex = shloksData.findIndex(s => s.chapter === chapter && s.shlok === shlokNumber);
  const currentShlok = currentShlokIndex !== -1 ? shloksData[currentShlokIndex] : shloksData[0];
  const isBookmarked = bookmarks.includes(currentShlok.id);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const bks = await getBookmarks();
      setBookmarks(bks);
    };
    fetchBookmarks();
  }, []);

  const toggleBookmark = async () => {
    if (isBookmarked) {
      await removeBookmark(currentShlok.id);
      setBookmarks(bookmarks.filter(id => id !== currentShlok.id));
    } else {
      await saveBookmark(currentShlok.id);
      setBookmarks([...bookmarks, currentShlok.id]);
    }
  };

  const handleNext = () => {
    if (currentShlokIndex < shloksData.length - 1) {
      const nextId = shloksData[currentShlokIndex + 1];
      navigate(`/read?chapter=${nextId.chapter}&shlok=${nextId.shlok}`);
    }
  };

  const handlePrev = () => {
    if (currentShlokIndex > 0) {
      const prevId = shloksData[currentShlokIndex - 1];
      navigate(`/read?chapter=${prevId.chapter}&shlok=${prevId.shlok}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bhagavad Gita ${currentShlok.chapter}:${currentShlok.shlok}`,
          text: `"${currentShlok.englishMeaning}"\n\n- Read on offline Gita PWA`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert("Native Web Share not supported on this device.");
    }
  };

  const toggleTransliteration = () => {
    const newPrefs = { ...a11y, showTransliteration: !a11y.showTransliteration };
    setA11y(newPrefs);
    saveA11yPrefs(newPrefs);
  };

  const cycleFontSize = () => {
    const sizes = ['small', 'normal', 'large', 'xlarge'];
    const nextSize = sizes[(sizes.indexOf(a11y.fontSize) + 1) % sizes.length];
    const newPrefs = { ...a11y, fontSize: nextSize };
    setA11y(newPrefs);
    saveA11yPrefs(newPrefs);
  };

  // Map sizes to CSS rem
  const sizeMap = {
    small: '1.2rem',
    normal: '1.5rem',
    large: '1.9rem',
    xlarge: '2.4rem'
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <div className="shlok-viewer-container">
      <div className="viewer-header">
        <button className="icon-button" onClick={() => navigate('/')} aria-label="Home">
          <Home size={24} />
        </button>
        <div className="chapter-badge">
          Chapter {currentShlok.chapter} • Shlok {currentShlok.shlok}
        </div>
        <div className="header-actions" style={{display: 'flex', gap: '8px', position: 'relative'}}>
          <button className="icon-button" onClick={() => setShowA11yMenu(!showA11yMenu)} aria-label="A11y Menu">
            <Type size={20} color={showA11yMenu ? "#FF9933" : "currentColor"} />
          </button>
          
          {showA11yMenu && (
            <div className="a11y-dropdown" style={{position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 50, boxShadow: 'var(--shadow-lg)'}}>
              <button className="icon-button" onClick={cycleFontSize} title={`Size: ${a11y.fontSize}`} style={{display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-start', padding: '4px 8px'}}><Type size={16}/> Size: {a11y.fontSize}</button>
              <button className="icon-button" onClick={toggleTransliteration} title="Toggle Script" style={{display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-start', padding: '4px 8px'}}><Languages size={16}/> {a11y.showTransliteration ? 'Hide Translit' : 'Show Translit'}</button>
            </div>
          )}

          <button className="icon-button" onClick={handleShare} aria-label="Share">
            <Share2 size={20} />
          </button>
          <button className="icon-button" onClick={() => setIsListening(!isListening)} aria-label="Voice Commands" title="Say 'Next' or 'Previous'">
            {isListening ? <Mic size={20} className="active-icon" color="#FF9933" /> : <MicOff size={20} />}
          </button>
          <button className="icon-button" onClick={() => setIsMeditationMode(!isMeditationMode)} aria-label="Meditation Mode" title="Auto-advance Shloks">
            <Waves size={20} color={isMeditationMode ? "#FF9933" : "currentColor"} />
          </button>
          <button className="icon-button" onClick={toggleBookmark} aria-label="Bookmark">
            {isBookmarked ? <BookmarkCheck size={20} className="bookmarked-icon" /> : <Bookmark size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentShlok.id}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="shlok-card"
        >
          {/* Text Section */}
          <div className="sanskrit-section">
            <h2 className="sanskrit-text" style={{ fontSize: sizeMap[a11y.fontSize], transition: 'font-size 0.3s ease' }}>
              {a11y.showTransliteration && currentShlok.transliteration ? currentShlok.transliteration : currentShlok.sanskrit}
            </h2>
          </div>

          {/* Audio Player */}
          <PremiumAudioPlayer 
            audioSrc={currentShlok.audioFile} 
            fallbackText={currentShlok.sanskrit}
            autoPlay={isMeditationMode} 
            onPlaybackEnd={() => {
              if (isMeditationMode) handleNext();
            }}
          />

          {/* Meaning Section */}
          <div className="text-section">
            <h3 className="section-title">Meaning</h3>
            <div className="meaning-block">
              <span className="lang-tag">Eng</span>
              <p>{currentShlok.englishMeaning}</p>
            </div>
            <div className="meaning-block">
              <span className="lang-tag marathi">Mar</span>
              <p>{currentShlok.marathiMeaning}</p>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="text-section">
            <h3 className="section-title">Explanation</h3>
            <p className="explanation-text">{currentShlok.englishExplanation}</p>
            <p className="explanation-text">{currentShlok.marathiExplanation}</p>
          </div>

          {/* Example Section */}
          <div className="text-section highlight-box">
            <h3 className="section-title">Real-life Example</h3>
            <p>{currentShlok.example}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="viewer-navigation">
        <button 
          className="nav-btn" 
          onClick={handlePrev} 
          disabled={currentShlokIndex === 0}
        >
          <ArrowLeft size={20} /> Prev
        </button>
        <button 
          className="nav-btn primary" 
          onClick={handleNext} 
          disabled={currentShlokIndex === shloksData.length - 1}
        >
          Next <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ShlokViewer;
