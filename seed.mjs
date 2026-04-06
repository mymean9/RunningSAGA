import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

const mockRoute1 = JSON.stringify([
  [37.5443, 127.0374], [37.5451, 127.0382], [37.5448, 127.0395], [37.5435, 127.0401], [37.5420, 127.0390]
]);
const mockRoute2 = JSON.stringify([
  [37.5255, 126.9368], [37.5262, 126.9385], [37.5270, 126.9400], [37.5275, 126.9421], [37.5265, 126.9450]
]);

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

async function run() {
  try {
    for (const r of defaultRunners) {
      await setDoc(doc(db, 'runners', r.id), r);
    }
    for (const g of defaultGroups) {
      await setDoc(doc(db, 'groups', g.id), g);
    }
    console.log('Seeded successfully!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
