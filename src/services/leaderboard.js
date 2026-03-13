import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Test Firebase connection
export async function testFirebaseConnection() {
  try {
    console.log('🔧 Testing Firebase connection...');
    const testRef = doc(db, 'test', 'connection_test');
    const testData = { timestamp: serverTimestamp(), status: 'connected' };
    
    await setDoc(testRef, testData);
    console.log('✅ Firebase write test successful!');
    
    const testGet = await getDoc(testRef);
    if (testGet.exists()) {
      console.log('✅ Firebase read test successful!');
      return true;
    }
  } catch (err) {
    console.error('❌ Firebase connection test FAILED:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    return false;
  }
}

// Save user profile and stats
export async function saveUserProfile(userId, data) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log('Profile saved for', userId);
    return true;
  } catch (err) {
    console.error('Error saving user profile:', err);
    return false;
  }
}

// Get user profile
export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (err) {
    console.error('Error getting user profile:', err);
    return null;
  }
}

// Submit score to leaderboard
export async function submitScore(userId, userData) {
  try {
    const { displayName, photoURL, level, wpm, maxCombo, difficulty } = userData;
    
    console.log('📊 Submitting score:', { userId, displayName, level, difficulty, wpm, maxCombo });
    
    const leaderboardRef = doc(db, 'leaderboard', `${difficulty}_${userId}`);
    
    // Get existing score
    const existing = await getDoc(leaderboardRef);
    const existingLevel = existing.exists() ? existing.data().level : 0;
    
    console.log('📊 Existing level:', existingLevel, 'New level:', level);
    
    // Only update if new score is higher
    if (level > existingLevel) {
      const scoreData = {
        displayName: displayName || 'Anonymous',
        photoURL: photoURL || null,
        level,
        wpm,
        maxCombo,
        difficulty,
        userId,
        updatedAt: serverTimestamp(),
      };
      
      console.log('📊 Writing score data:', scoreData);
      
      await setDoc(leaderboardRef, scoreData);
      console.log('✅ Score submitted successfully:', level, 'for difficulty:', difficulty);
    } else {
      console.log('⚠️ Score not higher than existing, skipping update');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error submitting score:', err);
    console.error('Error details:', err.message, err.code);
    return false;
  }
}

// Get leaderboard with optional time filter
export async function getLeaderboard(difficulty = 'normal', maxResults = 50, timeFilter = 'global') {
  try {
    console.log('🏆 Fetching leaderboard for difficulty:', difficulty, 'timeFilter:', timeFilter);
    
    const leaderboardRef = collection(db, 'leaderboard');
    
    // Calculate time threshold based on filter
    let timeThreshold = null;
    if (timeFilter !== 'global') {
      const now = new Date();
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      
      switch (timeFilter) {
        case 'daily':
          timeThreshold = new Date(now.getTime() - millisecondsPerDay);
          break;
        case 'weekly':
          timeThreshold = new Date(now.getTime() - 7 * millisecondsPerDay);
          break;
        case 'monthly':
          timeThreshold = new Date(now.getTime() - 30 * millisecondsPerDay);
          break;
        default:
          break;
      }
    }
    
    // Try with full query first
    try {
      const constraints = [
        where('difficulty', '==', difficulty),
        orderBy('level', 'desc'),
        orderBy('wpm', 'desc'),
        limit(maxResults)
      ];
      
      // Add time filter if applicable
      if (timeThreshold) {
        constraints.splice(1, 0, where('updatedAt', '>=', timeThreshold));
      }
      
      const q = query(leaderboardRef, ...constraints);
      
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('✅ Leaderboard loaded:', results.length, 'scores for', difficulty);
      return results;
    } catch (indexError) {
      // Fallback: simpler query if index not ready
      console.log('⚠️ Index not ready, using fallback query:', indexError.code);
      const q = query(
        leaderboardRef,
        where('difficulty', '==', difficulty),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      // Filter by time if needed
      const filtered = timeThreshold
        ? results.filter(r => r.updatedAt?.toDate() >= timeThreshold)
        : results;
      
      // Sort in memory
      filtered.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.wpm - a.wpm;
      });
      
      console.log('✅ Leaderboard (fallback) loaded:', filtered.length, 'scores for', difficulty);
      return filtered;
    }
  } catch (err) {
    console.error('❌ Error getting leaderboard:', err);
    console.error('Error code:', err.code);
    return [];
  }
}

// Submit daily challenge score
export async function submitDailyScore(userId, userData, dailyId) {
  try {
    const { displayName, photoURL, level, wpm, maxCombo } = userData;
    
    const dailyRef = doc(db, 'daily', `${dailyId}_${userId}`);
    
    const existing = await getDoc(dailyRef);
    const existingLevel = existing.exists() ? existing.data().level : 0;
    
    if (level > existingLevel) {
      await setDoc(dailyRef, {
        displayName: displayName || 'Anonymous',
        photoURL: photoURL || null,
        level,
        wpm,
        maxCombo,
        dailyId,
        userId,
        updatedAt: serverTimestamp(),
      });
      console.log('Daily score submitted:', level);
    }
    
    return true;
  } catch (err) {
    console.error('Error submitting daily score:', err);
    return false;
  }
}

// Get daily leaderboard
export async function getDailyLeaderboard(dailyId, maxResults = 50) {
  try {
    const dailyRef = collection(db, 'daily');
    
    try {
      const q = query(
        dailyRef,
        where('dailyId', '==', dailyId),
        orderBy('level', 'desc'),
        orderBy('wpm', 'desc'),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      return results;
    } catch (indexError) {
      // Fallback
      const q = query(
        dailyRef,
        where('dailyId', '==', dailyId),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      results.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.wpm - a.wpm;
      });
      
      return results;
    }
  } catch (err) {
    console.error('Error getting daily leaderboard:', err);
    return [];
  }
}

// Save achievements to user profile
export async function saveAchievements(userId, achievements) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      achievements,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving achievements:', err);
    return false;
  }
}
