import localforage from 'localforage';

localforage.config({
  name: 'BhagavadGitaApp',
  storeName: 'bookmarks_and_progress', 
  description: 'Stores bookmarks, daily shloks, and progress for offline use'
});

const BOOKMARKS_KEY = 'gita_bookmarks';
const DAILY_SHLOK_KEY = 'gita_daily_shlok';
const THEME_KEY = 'gita_theme';
const READ_SHLOKS_KEY = 'gita_read_shloks';
const A11Y_PREFS_KEY = 'gita_a11y_prefs';

export const saveBookmark = async (shlokId) => {
  try {
    const bookmarks = await getBookmarks();
    if (!bookmarks.includes(shlokId)) {
      bookmarks.push(shlokId);
      await localforage.setItem('bookmarks', bookmarks);
    }
  } catch (error) {
    console.error('Error saving bookmark:', error);
  }
};

export const removeBookmark = async (shlokId) => {
  try {
    const bookmarks = await getBookmarks();
    const newBookmarks = bookmarks.filter(id => id !== shlokId);
    await localforage.setItem(BOOKMARKS_KEY, newBookmarks);
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
};

export const getBookmarks = async () => {
  try {
    const bookmarks = await localforage.getItem(BOOKMARKS_KEY);
    return bookmarks || [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const setDailyShlok = async (shlokId, dateString) => {
  try {
    await localforage.setItem(DAILY_SHLOK_KEY, { shlokId, date: dateString });
  } catch (error) {
    console.error('Error setting daily shlok:', error);
  }
};

export const getDailyShlok = async () => {
  try {
    return await localforage.getItem(DAILY_SHLOK_KEY);
  } catch (error) {
    console.error('Error getting daily shlok:', error);
    return null;
  }
};

export const setThemePreference = async (isDark) => {
  try {
    await localforage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const saveThemePreference = async (theme) => {
  try {
    await localforage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error("Error saving theme preference:", error);
  }
};

export const getThemePreference = async () => {
  try {
    return await localforage.getItem(THEME_KEY);
  } catch (error) {
    console.error('Error getting theme preference:', error);
    return null;
  }
};

// --- Progress Tracking ---

export const getReadShloks = async () => {
    try {
        const reads = await localforage.getItem(READ_SHLOKS_KEY);
        return reads || [];
    } catch (e) {
        return [];
    }
};

export const markShlokRead = async (chapter, shlok) => {
    try {
        const reads = await getReadShloks();
        const id = `${chapter}-${shlok}`;
        if (!reads.includes(id)) {
            reads.push(id);
            await localforage.setItem(READ_SHLOKS_KEY, reads);
        }
    } catch (e) {
        console.error(e);
    }
};

// --- Accessibility Preferences ---

export const getA11yPrefs = async () => {
    try {
        const prefs = await localforage.getItem(A11Y_PREFS_KEY);
        return prefs || { fontSize: 'normal', showTransliteration: false };
    } catch (e) {
        return { fontSize: 'normal', showTransliteration: false };
    }
};

export const saveA11yPrefs = async (prefs) => {
    try {
        await localforage.setItem(A11Y_PREFS_KEY, prefs);
    } catch (e) {
        console.error(e);
    }
};
