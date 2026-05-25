const ADMIN_ACCESS_CODE = 'UNIC@Admin2026';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  let isRegistering = false;
  
  // Auth state listener
  auth.onAuthStateChanged(async (user) => {
    if (isRegistering) return;
    if (user && (window.location.pathname.includes('/admin/login.html') || window.location.pathname.includes('/admin/register.html'))) {
      checkAdminStatus(user);
    }
  });

  // Init Login Form
  if (loginForm) {
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        const pwdInput = document.getElementById('loginPassword');
        if (pwdInput.type === 'password') {
          pwdInput.type = 'text';
          togglePasswordBtn.textContent = '🙈';
        } else {
          pwdInput.type = 'password';
          togglePasswordBtn.textContent = '👁';
        }
      });
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorDiv = document.getElementById('loginError');
      const submitBtn = document.getElementById('loginSubmit');
      
      if (!email || !password) {
        showError(errorDiv, 'Please enter both email and password.');
        return;
      }
      
      try {
        errorDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></span> Signing In...';
        
        await auth.signInWithEmailAndPassword(email, password);
        // auth listener will handle redirect
      } catch (error) {
        console.error('Login error:', error);
        showError(errorDiv, getAuthErrorMessage(error.code));
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Secure Sign In';
      }
    });
  }

  // Init Register Form
  if (registerForm) {
    const toggleRegPasswordBtn = document.getElementById('toggleRegPassword');
    if (toggleRegPasswordBtn) {
      toggleRegPasswordBtn.addEventListener('click', () => {
        const passInput = document.getElementById('regPassword');
        if (passInput.type === 'password') {
          passInput.type = 'text';
          toggleRegPasswordBtn.textContent = '🙈';
        } else {
          passInput.type = 'password';
          toggleRegPasswordBtn.textContent = '👁';
        }
      });
    }

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('regName').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const adminCode = document.getElementById('regAdminCode').value.trim();
      const submitBtn = document.getElementById('registerSubmit');
      const errorEl = document.getElementById('registerError');

      if (!name || !phone || !email || !password || !adminCode) {
        showError(errorEl, 'Please fill in all fields including the Admin Access Code.');
        return;
      }

      if (adminCode !== ADMIN_ACCESS_CODE) {
        showError(errorEl, 'Invalid Admin Access Code. Please ask the owner for the correct code.');
        return;
      }

      if (password.length < 6) {
        showError(errorEl, 'Password must be at least 6 characters.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></span> Creating account...';

      try {
        isRegistering = true;
        // 1. Create Auth User
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 2. Create the document in 'admins' collection
        await db.collection('admins').doc(user.uid).set({
          uid: user.uid,
          name: name,
          email: email,
          phone: phone,
          role: 'admin',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Success! Your admin account has been created and activated. You can now log in.');
        await auth.signOut();
        window.location.href = 'login.html';

      } catch (error) {
        isRegistering = false;
        console.error('Registration error:', error);
        let message = 'An error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          message = 'This email is already registered. Please login instead.';
        } else if (error.code === 'auth/invalid-email') {
          message = 'Please enter a valid email address.';
        } else if (error.code === 'auth/weak-password') {
          message = 'Password is too weak. Use at least 6 characters.';
        } else if (error.code === 'permission-denied') {
          message = 'Permission denied. Ensure your Firestore Security Rules allow creation.';
        } else {
          message = error.message || message;
        }
        showError(errorEl, message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Register Account';
      }
    });
  }

  function showError(el, msg) {
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  function getAuthErrorMessage(code) {
    switch (code) {
      case 'auth/user-not-found': return 'No admin account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/invalid-email': return 'Invalid email address format.';
      case 'auth/too-many-requests': return 'Too many failed attempts. Please try again later.';
      default: return 'Failed to sign in. Please try again.';
    }
  }

  async function checkAdminStatus(user) {
    try {
      const adminDoc = await db.collection('admins').doc(user.uid).get();
      if (adminDoc.exists) {
        window.location.href = 'dashboard.html';
      } else {
        await auth.signOut();
        const errEl = document.getElementById('loginError');
        if (errEl) showError(errEl, 'Access denied. You do not have admin privileges.');
      }
    } catch (e) {
      console.error('Error checking admin status:', e);
      const errEl = document.getElementById('loginError');
      if (errEl) showError(errEl, 'Error verifying admin status.');
    }
  }
});
