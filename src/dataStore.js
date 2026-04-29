import { reactive, watch } from 'vue';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, writeBatch, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const firebaseConfig = {
  apiKey: "AIzaSyCHX3gxS3eo_1TDDXFmz2RmgvAmnEyA7R0",
  authDomain: "running-saga-d07a9.firebaseapp.com",
  projectId: "running-saga-d07a9",
  storageBucket: "running-saga-d07a9.firebasestorage.app",
  messagingSenderId: "222451467237",
  appId: "1:222451467237:web:c350f48cc2632af746250c",
  measurementId: "G-L8TXW0XBZB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initial runners data with activities support
const mockRoute1 = JSON.stringify([
  [37.5443, 127.0374], [37.5451, 127.0382], [37.5448, 127.0395], [37.5435, 127.0401], [37.5420, 127.0390]
]); // Seoul Forest
const mockRoute2 = JSON.stringify([
  [37.5255, 126.9368], [37.5262, 126.9385], [37.5270, 126.9400], [37.5275, 126.9421], [37.5265, 126.9450]
]); // Han River

const defaultRunners = [
  { id: '1', uid: '1', name: 'HAN SANG-MIN', email: 'han@saga.com', groupId: 'g1', distance: 154.2, pace: "4'12\"", runs: 18, progress: 85, lastImage: null, activities: [
    { id: 'mock1', distance: 3.2, pace: "4'10\"", date: new Date().toISOString(), image: null, route: mockRoute1 },
    { id: 'mock2', distance: 5.5, pace: "4'25\"", date: new Date().toISOString(), image: null, route: mockRoute2 }
  ] },
  { id: '2', uid: '2', name: 'LEE SEO-YEON', email: 'lee@saga.com', groupId: 'g1', distance: 142.8, pace: "4'28\"", runs: 15, progress: 78, lastImage: null, activities: [] },
  { id: '3', uid: '3', name: 'PARK JI-HOON', email: 'park@saga.com', groupId: null, distance: 138.5, pace: "4'45\"", runs: 22, progress: 75, lastImage: null, activities: [] },
  { id: '4', uid: '4', name: 'CHOI YU-NA', email: 'choi@saga.com', groupId: null, distance: 125.1, pace: "5'05\"", runs: 12, progress: 68, lastImage: null, activities: [] },
  { id: '5', uid: '5', name: 'JUNG HYUN-WOO', email: 'jung@saga.com', groupId: null, distance: 118.9, pace: "5'12\"", runs: 10, progress: 62, lastImage: null, activities: [] }
];

const defaultGroups = [
  { id: 'g1', name: 'SAGA ORIGINALS', ownerId: '1', secretCode: 'SAGA2026' }
];

const savedUser = JSON.parse(localStorage.getItem('saga_user') || 'null');
const savedLocale = localStorage.getItem('saga_locale') || 'ko';

export const store = reactive({
  runners: [],
  groups: [],
  user: savedUser,
  loading: false,
  isTrackingActive: false,
  locale: savedLocale,

  initAuth() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this._loadUserProfile(user.uid, user.email);
      } else {
        this.user = null;
      }
    });
  },

  // Translation Dictionary
  translations: {
    ko: {
      your_distance: '나의 누적 거리',
      tribe_total: '크루 전체 거리',
      my_saga_crew: '나의 사가 크루',
      invite_code: '초대 코드',
      leave_crew: '크루 탈퇴',
      running_solo: '솔로 러닝 중',
      solo_desc: '현재 소속된 크루가 없습니다. 대시보드에는 본인의 기록만 표시됩니다. 크루를 생성하거나 참가하여 다른 러너들과 경쟁해보세요.',
      create_crew: '크루 생성',
      join_crew: '크루 참가',
      no_runners: '아직 참가한 러너가 없습니다. 첫 번째가 되어보세요!',
      build_v: '러닝 사가 빌드',
      final_update: '최종 안정화 업데이트',
      enter_crew_name: '새로운 크루 이름을 입력하세요:',
      enter_crew_code: '6자리 크루 초대 코드를 입력하세요:',
      invalid_code: '유효하지 않은 코드입니다. 다시 확인해주세요.',
      joined_success: '크루에 성공적으로 참가했습니다!',
      leave_confirm: '정말 크루를 탈퇴하시겠습니까? 리더보드 접근 권한을 잃게 됩니다.',
      km: 'KM'
    },
    en: {
      your_distance: 'YOUR DISTANCE',
      tribe_total: 'TRIBE TOTAL',
      my_saga_crew: 'MY SAGA CREW',
      invite_code: 'INVITE CODE',
      leave_crew: 'LEAVE CREW',
      running_solo: 'RUNNING SOLO',
      solo_desc: 'YOU ARE CURRENTLY NOT IN A CREW. YOUR DASHBOARD ONLY SHOWS YOUR OWN STATS. CREATE OR JOIN A CREW TO COMPETE WITH OTHERS.',
      create_crew: 'CREATE CREW',
      join_crew: 'JOIN CREW',
      no_runners: 'NO RUNNERS JOINED YET. BE THE FIRST!',
      build_v: 'Running.SAGA Build',
      final_update: 'Final Stable Update',
      enter_crew_name: 'ENTER NEW CREW NAME:',
      enter_crew_code: 'ENTER 6-CHARACTER CREW INVITE CODE:',
      invalid_code: 'INVALID CREW CODE. PLEASE CHECK AND TRY AGAIN.',
      joined_success: 'SUCCESSFULLY JOINED THE CREW!',
      leave_confirm: 'ARE YOU SURE YOU WANT TO LEAVE THIS CREW? YOU WILL LOSE ACCESS TO THE CREW LEADERBOARD.',
      km: 'KM'
    }
  },

  // Translation Helper
  t(key) {
    try {
      if (!this.translations || !this.translations[this.locale]) return key;
      return this.translations[this.locale][key] || key;
    } catch (e) {
      return key;
    }
  },

  setLocale(lang) {
    this.locale = lang;
    localStorage.setItem('saga_locale', lang);
  },

  async signup(email, password, displayName) {
    this.loading = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const newProfile = {
        id: uid, uid,
        email,
        name: displayName.toUpperCase(),
        groupId: null,
        distance: 0,
        runs: 0,
        pace: "0'00\"",
        progress: 0,
        lastImage: null,
        activities: []
      };
      await setDoc(doc(db, 'runners', uid), newProfile);
      this.user = newProfile;
    } catch(e) {
      alert('SIGNUP ERROR: ' + e.message);
    }
    this.loading = false;
  },

  async login(email, password) {
    this.loading = true;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await this._loadUserProfile(cred.user.uid, email);
    } catch(e) {
      alert('LOGIN ERROR: ' + e.message);
    }
    this.loading = false;
  },

  async loginWithGoogle() {
    this.loading = true;
    try {
      let fbUser = null;

      if (Capacitor.isNativePlatform()) {
        // Native Google Login for Android/iOS
        const result = await FirebaseAuthentication.signInWithGoogle({
          webClientId: '222451467237-0306kcr9v2jbp9nv1scphtjtfsju31k3.apps.googleusercontent.com'
        });
        
        if (!result.idToken) {
          throw new Error(`Google Sign-In failed: idToken is missing. Check your Firebase SHA-1 and Client ID config.`);
        }

        const credential = GoogleAuthProvider.credential(result.idToken);
        const cred = await signInWithCredential(auth, credential);
        fbUser = cred.user;
      } else {
        // Web Google Login (Browser)
        const result = await signInWithPopup(auth, googleProvider);
        fbUser = result.user;
      }

      const profileRef = doc(db, 'runners', fbUser.uid);
      const snap = await getDoc(profileRef);
      
      if (!snap.exists()) {
        await this._loadUserProfile(fbUser.uid, fbUser.email);
        if (!this.user) {
          const newProfile = {
            id: fbUser.uid, uid: fbUser.uid,
            email: fbUser.email,
            name: (fbUser.displayName || fbUser.email.split('@')[0]).toUpperCase(),
            groupId: null,
            distance: 0, runs: 0,
            pace: "0'00\"",
            progress: 0,
            lastImage: null,
            activities: []
          };
          await setDoc(profileRef, newProfile);
          this.user = newProfile;
        }
      } else {
        this.user = snap.data();
      }
    } catch(e) {
      console.error('FULL GOOGLE LOGIN ERROR:', e);
      const errorJson = JSON.stringify(e, Object.getOwnPropertyNames(e), 2);
      const errorMessage = e.message || 'Unknown error';
      const errorCode = e.code || 'N/A';
      alert(`GOOGLE LOGIN ERROR (Code: ${errorCode})\n\nMessage: ${errorMessage}\n\nFull Detail: ${errorJson}`);
    } finally {
      this.loading = false;
    }
  },

  async _loadUserProfile(uid, email = null) {
    // 1. Try to find by UID first (normal case)
    const snap = await getDoc(doc(db, 'runners', uid));
    if (snap.exists()) {
      this.user = snap.data();
      return;
    }

    // 2. Fallback: find legacy runner by email and migrate UID
    if (email) {
      const legacyRunner = this.runners.find(r => r.email === email);
      if (legacyRunner) {
        const oldId = legacyRunner.id || legacyRunner.uid;
        const migratedProfile = { ...legacyRunner, id: uid, uid: uid };
        // Write under new UID
        await setDoc(doc(db, 'runners', uid), migratedProfile);
        // Delete old doc if different
        if (oldId !== uid) {
          try {
            await deleteDoc(doc(db, 'runners', oldId));
          } catch(e) { console.warn('Could not remove old runner doc', e); }
        }
        this.user = migratedProfile;
        return;
      }
    }
    // 3. No profile found - user will be prompted to set up profile
    console.warn('No Firestore profile found for UID:', uid);
  },

  logout() {
    signOut(auth);
    this.user = null;
  },

  async addRun(data) {
    const runner = this.runners.find(r => r.name === data.name);
    if (runner) {
      const runnerId = runner.id || runner.uid;
      const newActivity = {
        id: Date.now().toString(),
        distance: data.distance,
        pace: data.pace,
        date: data.date,
        image: data.image,
        route: JSON.stringify(data.route || [])
      };

      const updatedDistance = Number(((runner.distance || 0) + (data.distance || 0)).toFixed(3));
      const updatedRunner = {
        ...runner,
        activities: [newActivity, ...(runner.activities || [])],
        distance: updatedDistance,
        runs: runner.runs + 1,
        pace: data.pace,
        lastImage: data.image,
        progress: Math.min(Math.round((updatedDistance / 200) * 100), 100)
      };
      
      await updateDoc(doc(db, 'runners', runnerId), updatedRunner);
      
      if (this.user && this.user.name === runner.name) {
        this.user = { ...updatedRunner };
      }
    }
  },

  async createGroup(groupName) {
    if (!this.user) return;
    const ownerId = this.user.id || this.user.uid;
    const newGroup = {
      id: 'g_' + Date.now().toString(),
      name: groupName.toUpperCase(),
      ownerId: ownerId,
      secretCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };
    
    await setDoc(doc(db, 'groups', newGroup.id), newGroup);
    await updateDoc(doc(db, 'runners', ownerId), { groupId: newGroup.id });
    this.user.groupId = newGroup.id;
  },

  async joinGroup(secretCode) {
    if (!this.user) return false;
    const group = this.groups.find(g => g.secretCode === secretCode.toUpperCase());
    if (group) {
      const runnerId = this.user.id || this.user.uid;
      await updateDoc(doc(db, 'runners', runnerId), { groupId: group.id });
      this.user.groupId = group.id;
      return true;
    }
    return false;
  },
  
  async leaveGroup() {
    if (!this.user) return;
    const runnerId = this.user.id || this.user.uid;
    await updateDoc(doc(db, 'runners', runnerId), { groupId: null });
    this.user.groupId = null;
  }
});

// Firebase Syncing
const runnersCol = collection(db, 'runners');
const groupsCol = collection(db, 'groups');

const seedDatabase = async () => {
  const batch = writeBatch(db);
  defaultRunners.forEach(r => {
    batch.set(doc(runnersCol, r.id.toString()), r);
  });
  defaultGroups.forEach(g => {
    batch.set(doc(groupsCol, g.id.toString()), g);
  });
  await batch.commit();
  console.log("Firebase DB Seeded with Defaults!");
};

// Auth Listener to keep store.user in sync and handle permissions
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Firebase Auth State: Logged In", user.uid);
    // You could fetch more detailed runner data here if needed
  } else {
    console.log("Firebase Auth State: Logged Out");
    // store.user = null; // Don't clear immediately to keep localStorage for now
  }
});

let isFirestoreSyncing = false;

const startFirestoreSync = () => {
  if (isFirestoreSyncing) return;
  isFirestoreSyncing = true;
  
  console.log("Starting Firestore Real-time Sync...");
  
  onSnapshot(runnersCol, (snapshot) => {
    if (snapshot.empty) {
      seedDatabase();
    } else {
      store.runners = snapshot.docs.map(doc => doc.data());
    }
  }, (error) => {
    console.error('FIRESTORE RUNNERS ERROR:', error.message);
    if (error.code === 'permission-denied') {
       console.warn("Permission denied. Ensure you are logged in.");
    }
  });

  onSnapshot(groupsCol, (snapshot) => {
    if (!snapshot.empty) {
      store.groups = snapshot.docs.map(doc => doc.data());
    }
  }, (error) => {
    console.error('FIRESTORE GROUPS ERROR:', error.message);
  });
};

// Auth Listener: The most reliable way to handle authenticated data access
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Firebase Auth Verified:", user.uid);
    // Once we are sure user is logged in, start syncing data
    startFirestoreSync();
  } else {
    console.log("Firebase Auth: No active session.");
    // Even if not logged in, we try to sync (it will fail if rules block it, but that's expected)
    // If you want to allow guest viewing, change rules to allow read if true
    startFirestoreSync(); 
  }
});

// Retain active user locally across reloads
watch(() => store.user, (val) => {
  localStorage.setItem('saga_user', JSON.stringify(val));
}, { deep: true });
