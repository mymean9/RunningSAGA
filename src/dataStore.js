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
      km: 'KM',
      login: '로그인',
      signup: '회원가입',
      email: '이메일 주소',
      password: '비밀번호',
      name: '이름',
      google_login: '구글로 계속하기',
      no_account: '계정이 없으신가요?',
      have_account: '이미 계정이 있으신가요?',
      auth_title: '사가 러닝 시작하기',
      auth_desc: '안전한 실시간 트래킹과 크루 경쟁을 위해 로그인하세요.',
      welcome_back: '다시 오신 것을 환영합니다',
      rank: '순위',
      runner: '러너',
      distance: '거리',
      pace: '페이스',
      runs: '횟수',
      total_stats: '누적 통계',
      weekly_activity: '주간 활동',
      activity_logs: '활동 기록',
      no_activities: '아직 기록된 활동이 없습니다.',
      log_activity: '활동 기록하기',
      date: '날짜',
      duration: '시간',
      save_record: '기록 저장',
      cancel: '취소',
      recent_route: '최근 경로',
      recenter: '중앙으로',
      minimize: '축소',
      back_to_logs: '기록으로 돌아가기',
      delete_activity: '활동 삭제',
      delete_confirm: '정말 이 활동을 삭제하시겠습니까?',
      insights: '통계',
      collective_performance: '러너들의 종합적인 퍼포먼스 및 마일스톤 추적',
      monthly_milestone: '이달의 마일스톤',
      road_to: '목표까지',
      current_total: '현재 합계',
      completed: '달성',
      remaining: '남음',
      total_sessions: '총 세션',
      avg_pace: '평균 페이스',
      active_runners: '활동 중인 러너',
      athletes: '운동선수',
      still_to_go: '남은 인원',
      at_finish_line: '목표 달성',
      target: '목표',
      total: '합계',
      individual_stakes: '개별 기여도',
      by_distance: '거리 기준',
      run: '달리기',
      compete: '경쟁',
      dominate: '지배',
      join_saga_btn: '사가 시작하기',
      landing_desc: '사가 러닝은 단순한 트래킹을 넘어, 크루원들과의 경쟁을 통해 당신의 한계를 뛰어넘는 경험을 제공합니다.'
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
      km: 'KM',
      login: 'LOGIN',
      signup: 'SIGN UP',
      email: 'EMAIL ADDRESS',
      password: 'PASSWORD',
      name: 'FULL NAME',
      google_login: 'CONTINUE WITH GOOGLE',
      no_account: "Don't have an account?",
      have_account: 'Already have an account?',
      auth_title: 'START YOUR SAGA',
      auth_desc: 'Sign in for secure real-time tracking and crew competition.',
      welcome_back: 'WELCOME BACK',
      rank: 'RANK',
      runner: 'RUNNER',
      distance: 'DIST',
      pace: 'PACE',
      runs: 'RUNS',
      total_stats: 'TOTAL STATS',
      weekly_activity: 'WEEKLY ACTIVITY',
      activity_logs: 'ACTIVITY LOGS',
      no_activities: 'NO ACTIVITIES RECORDED YET.',
      log_activity: 'LOG ACTIVITY',
      date: 'DATE',
      duration: 'DURATION',
      save_record: 'SAVE RECORD',
      cancel: 'CANCEL',
      recent_route: 'RECENT ROUTE',
      recenter: 'RECENTER',
      minimize: 'MINIMIZE',
      back_to_logs: 'BACK TO LOGS',
      delete_activity: 'DELETE ACTIVITY',
      delete_confirm: 'ARE YOU SURE YOU WANT TO DELETE THIS ACTIVITY?',
      insights: 'INSIGHTS',
      collective_performance: 'Collective performance & milestone tracking',
      monthly_milestone: 'MONTHLY MILESTONE',
      road_to: 'ROAD TO',
      current_total: 'CURRENT TOTAL',
      completed: 'COMPLETED',
      remaining: 'REMAINING',
      total_sessions: 'TOTAL SESSIONS',
      avg_pace: 'AVG TRIBE PACE',
      active_runners: 'ACTIVE RUNNERS',
      athletes: 'ATHLETES',
      still_to_go: 'STILL TO GO',
      at_finish_line: 'AT FINISH LINE',
      target: 'TARGET',
      total: 'TOTAL',
      individual_stakes: 'INDIVIDUAL STAKES',
      by_distance: 'BY DISTANCE',
      run: 'RUN',
      compete: 'COMPETE',
      dominate: 'DOMINATE',
      join_saga_btn: 'JOIN THE SAGA',
      landing_desc: 'TRANSFORM YOUR RUNS INTO AN EPIC QUEST. TRACK EVERY STRIDE, COMPETE WITH YOUR CREW, AND DOMINATE THE LEADERBOARD.'
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

let runnersUnsubscribe = null;
let groupsUnsubscribe = null;

const startFirestoreSync = () => {
  // Clear existing listeners if any
  if (runnersUnsubscribe) runnersUnsubscribe();
  if (groupsUnsubscribe) groupsUnsubscribe();
  
  console.log("Initializing Firestore Sync (Auth State Checked)...");
  
  runnersUnsubscribe = onSnapshot(runnersCol, (snapshot) => {
    if (snapshot.empty) {
      console.log("Database is empty.");
    } else {
      store.runners = snapshot.docs.map(doc => doc.data());
    }
  }, (error) => {
    console.error('FIRESTORE RUNNERS ERROR:', error.message);
  });

  groupsUnsubscribe = onSnapshot(groupsCol, (snapshot) => {
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
    console.log("Auth State: Logged In", user.uid);
    startFirestoreSync();
  } else {
    console.log("Auth State: Logged Out / Guest");
    startFirestoreSync(); 
  }
});

// Retain active user locally across reloads
watch(() => store.user, (val) => {
  localStorage.setItem('saga_user', JSON.stringify(val));
}, { deep: true });
