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

export const store = reactive({
  runners: [],
  groups: [],
  user: savedUser,
  loading: false,
  isTrackingActive: false,

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

      const updatedDistance = Number((runner.distance + data.distance).toFixed(3));
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

onSnapshot(runnersCol, (snapshot) => {
  if (snapshot.empty) {
    seedDatabase();
  } else {
    store.runners = snapshot.docs.map(doc => doc.data());
  }
});

onSnapshot(groupsCol, (snapshot) => {
  if (!snapshot.empty) {
    store.groups = snapshot.docs.map(doc => doc.data());
  }
});

// Retain active user locally across reloads
watch(() => store.user, (val) => {
  localStorage.setItem('saga_user', JSON.stringify(val));
}, { deep: true });
