const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const forgotLink = document.getElementById('forgotLink');
const backToSignIn = document.getElementById('backToSignIn');
const container = document.getElementById('container');

// Toggle Sign Up/Sign In Panels
signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
  document.querySelector('.forgot-container').style.display = 'none';
  document.querySelector('.sign-in-container').style.display = 'block';
});

// Forgot Password Toggle
if (forgotLink) {
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.forgot-container').style.display = 'block';
    document.querySelector('.sign-in-container').style.display = 'none';
  });
}

if (backToSignIn) {
  backToSignIn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.forgot-container').style.display = 'none';
    document.querySelector('.sign-in-container').style.display = 'block';
  });
}

// ===== LOGIN FORM HANDLER =====
document.getElementById('login-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const emailInput = this.querySelector('input[type="email"]');
  const passInput = this.querySelector('input[type="password"]');
  const roleSelect = this.querySelector('select');

  const email = emailInput.value.trim();
  const password = passInput.value.trim();
  const role = roleSelect?.value;

  if (!email || !password || !role) return alert("Please fill in all fields");

  try {
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', email);
      localStorage.setItem('userId', data.userId);

      // Clear input fields
      this.reset();

      if (data.role === 'user') {
        window.location.href = `user_home.html?name=${encodeURIComponent(data.username)}`;
      } else {
        alert(`Logged in as ${data.role}`);
      }
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error(err);
    alert('Server error during login');
  }
});

// ===== SIGNUP FORM HANDLER =====
document.getElementById('signup-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = this.querySelector('input[placeholder="Username"]').value.trim();
  const email = this.querySelector('input[placeholder="Email"]').value.trim();
  const phone = this.querySelector('input[placeholder="Phone Number"]').value.trim();
  const country = this.querySelector('select:nth-of-type(1)')?.value;
  const password = this.querySelector('input[placeholder="Password"]').value.trim();
  const role = this.querySelector('select:nth-of-type(2)')?.value;

  if (!username || !email || !password || !role || !phone || !country) {
    return alert("Please fill in all fields");
  }

  try {
    const res = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, phone, password, role, country })
    });

    const msg = await res.text();
    if (res.ok) {
      alert("Signup successful! Please log in.");
      container.classList.remove("right-panel-active");
      this.reset(); // Clear the signup form
    } else {
      alert(msg || "Signup failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server error during signup");
  }
});

// ===== FORGOT PASSWORD PLACEHOLDER =====
document.querySelector('.forgot-container form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const emailInput = this.querySelector('input[type="email"]');
  const email = emailInput.value.trim();

  if (email) {
    alert(`If registered, a reset link will be sent to: ${email}`);
    emailInput.value = ''; // clear email input
    document.querySelector('.forgot-container').style.display = 'none';
    document.querySelector('.sign-in-container').style.display = 'block';
  } else {
    alert("Enter your email");
  }
});
