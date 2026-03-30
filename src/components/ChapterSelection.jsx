import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PlayCircle, Frown, Compass, Activity, ShieldAlert, X, Target } from 'lucide-react';
import './ChapterSelection.css';
import shloksData from '../data/shloks.json';
import { getReadShloks } from '../services/storageManager';

const EMOTIONS = [
  { id: 'anxiety', label: 'Anxious', icon: <Activity size={18} />, target: { ch: 2, sl: 47 } },
  { id: 'anger', label: 'Angry', icon: <ShieldAlert size={18} />, target: { ch: 2, sl: 63 } },
  { id: 'lost', label: 'Lost', icon: <Compass size={18} />, target: { ch: 18, sl: 66 } },
  { id: 'demotivated', label: 'Demotivated', icon: <Frown size={18} />, target: { ch: 6, sl: 5 } },
  { id: 'greedy', label: 'Greedy', icon: <Target size={18} />, target: { ch: 16, sl: 21 } }
];

const ChapterSelection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [readCount, setReadCount] = useState(0);

  useEffect(() => {
    // Load read progress
    getReadShloks().then(reads => setReadCount(reads.length));
  }, []);

  // Base Data Processing
  const TOTAL_SHLOKS = 700;
  const progressPercent = Math.min(Math.round((readCount / TOTAL_SHLOKS) * 100), 100);

  const chapters = Array.from(new Set(shloksData.map(s => s.chapter))).map(chapterNum => {
    return {
      number: chapterNum,
      title: `Chapter ${chapterNum}`,
      shloksCount: shloksData.filter(s => s.chapter === chapterNum).length,
    };
  });

  // Search Logic
  const filteredShloks = searchQuery.trim() !== '' 
    ? shloksData.filter(s => 
        s.englishMeaning.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.sanskrit.includes(searchQuery) ||
        String(s.chapter).includes(searchQuery) ||
        String(s.shlok).includes(searchQuery)
      ).slice(0, 10) // show top 10 results
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="chapter-selection">
      
      {/* Dynamic Header & Progress Tracking */}
      <div className="dashboard-header">
        <h2 className="sanskrit-text greeting" style={{marginBottom: '0.2rem'}}>श्रीमद्भगवद्गीता</h2>
        <p className="subtitle" style={{marginBottom: '1rem', opacity: 0.8}}>The Song of the Lord</p>
        
        <div className="progress-container-dash">
          <div className="progress-header">
            <span>Your Journey</span>
            <span>{readCount} / {TOTAL_SHLOKS} ({progressPercent}%)</span>
          </div>
          <div className="progress-track-dash">
            <motion.div 
              className="progress-fill-dash" 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercent}%` }} 
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Global Search Engine */}
      <div className="search-container">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search keywords, verse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && <X size={20} className="clear-icon" onClick={() => setSearchQuery('')} />}
        </div>

        <AnimatePresence>
          {searchQuery && (
            <motion.div 
              className="search-results"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {filteredShloks.length > 0 ? filteredShloks.map(s => (
                <div key={`${s.chapter}-${s.shlok}`} className="search-result-item" onClick={() => navigate(`/read?chapter=${s.chapter}&shlok=${s.shlok}`)}>
                  <strong>{s.chapter}:{s.shlok}</strong> - {s.englishMeaning.substring(0, 50)}...
                </div>
              )) : (
                <div className="search-result-item" style={{justifyContent: 'center', opacity: 0.7}}>No verses found</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emotion Recommender System */}
      <div className="emotions-section">
        <h4 className="section-title">How are you feeling?</h4>
        <div className="emotions-scroll">
          {EMOTIONS.map(emo => (
            <motion.button 
              key={emo.id} 
              className="emotion-chip"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/read?chapter=${emo.target.ch}&shlok=${emo.target.sl}`)}
            >
              {emo.icon}
              <span>{emo.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Traditional Chapter Layout */}
      <motion.div 
        className="chapter-list"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{marginTop: '1rem'}}
      >
        <h4 className="section-title" style={{marginBottom: '1rem'}}>All Chapters</h4>
        {chapters.map((chapter) => (
          <motion.div 
            key={chapter.number} 
            className="chapter-card"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/read?chapter=${chapter.number}&shlok=1`)}
          >
            <div className="chapter-info">
              <span className="chapter-num">{chapter.number}</span>
              <div className="chapter-details">
                <h3>{chapter.title}</h3>
                <p className="verses-count">{chapter.shloksCount} Verses Available</p>
              </div>
            </div>
            <PlayCircle className="play-icon" size={28} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ChapterSelection;
