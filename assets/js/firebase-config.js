// ============================================================
// UNIC Home Furniture — Firebase Configuration
// ============================================================

const firebaseConfig = {
  // TODO: Replace with UNIC Furnitures Firebase credentials
  apiKey: "AIzaSy_YOUR_API_KEY",
  authDomain: "unic-furnitures.firebaseapp.com",
  projectId: "unic-furnitures",
  storageBucket: "unic-furnitures.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  measurementId: "G-XXXXXXXXX"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("🔥 Firebase initialized for UNIC Furnitures");
}

if (typeof window.auth === 'undefined') window.auth = firebase.auth();
if (typeof window.db === 'undefined') window.db = firebase.firestore();
if (typeof window.storage === 'undefined') window.storage = firebase.storage();

// Global aliases
var auth = window.auth;
var db = window.db;
var storage = window.storage;

// Collections
var productsRef = db.collection("products");
var categoriesRef = db.collection("categories");
var adminsRef = db.collection("admins");
var uploadsRef = db.collection("uploads");
var featuredProductsRef = db.collection("featuredProducts");
