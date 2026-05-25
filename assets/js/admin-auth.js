document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const togglePasswordBtn = document.getElementById('togglePassword');
  
  // Auth state listener
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in, check if they are an admin
      checkAdminStatus(user);
    }
  });

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

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorDiv = document.getElementById('loginError');
      const submitBtn = document.getElementById('loginSubmit');
      
      if (!email || !password) {
        showError('Please enter both email and password.');
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
        showError(getAuthErrorMessage(error.code));
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Secure Sign In';
      }
    });
  }

  function showError(msg) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
      errorDiv.textContent = msg;
      errorDiv.style.display = 'block';
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
        // Not an admin, sign out
        await auth.signOut();
        showError('Access denied. You do not have admin privileges.');
      }
    } catch (e) {
      console.error('Error checking admin status:', e);
      showError('Error verifying admin status.');
    }
  }
});
