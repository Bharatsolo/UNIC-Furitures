// ============================================================
// UNIC Home Furniture — Firebase Configuration
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDM2PZM5UCR7m6yUlWL-XPTiGRbKlR7w4o",
  authDomain: "unic-furnitures.firebaseapp.com",
  projectId: "unic-furnitures",
  storageBucket: "unic-furnitures.firebasestorage.app",
  messagingSenderId: "117100148786",
  appId: "1:117100148786:web:305e94e47f454398c2a42b",
  measurementId: "G-70Q4EYK7MS"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("🔥 Firebase initialized for UNIC Furnitures");
}

if (typeof window.auth === 'undefined' && typeof firebase.auth === 'function') window.auth = firebase.auth();
if (typeof window.db === 'undefined' && typeof firebase.firestore === 'function') window.db = firebase.firestore();
if (typeof window.storage === 'undefined' && typeof firebase.storage === 'function') window.storage = firebase.storage();

// Global aliases
var auth = window.auth;
var db = window.db;
var storage = window.storage;

// Collections
var productsRef = db ? db.collection("products") : null;
var categoriesRef = db ? db.collection("categories") : null;
var adminsRef = db ? db.collection("admins") : null;
var uploadsRef = db ? db.collection("uploads") : null;
var featuredProductsRef = db ? db.collection("featuredProducts") : null;
