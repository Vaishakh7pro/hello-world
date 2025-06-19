let allMovies = [];

// === FETCH & RENDER MOVIES FROM BACKEND ===
async function fetchNowShowingMovies() {
  try {
    const res = await fetch('http://localhost:5000/api/now-showing');
    const movies = await res.json();
    allMovies = movies;
    renderMovies(allMovies);
  } catch (err) {
    console.error('❌ Error fetching movies:', err);
  }
}

// === RENDER MOVIES TO DOM ===
function renderMovies(movies) {
  const section = document.getElementById('now-showing');
  const container = document.getElementById('movies-container');
  container.innerHTML = '';

  if (!movies || movies.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${movie.poster_url}" alt="${movie.title}">
      <h4>${movie.title}</h4>
      <p><strong>Genre:</strong> ${movie.genre}</p>
      <p><strong>Theater:</strong> ${movie.theater_name}</p>
      <p><strong>Location:</strong> ${movie.location}</p>
      <button class="btn book-btn" data-title="${movie.title}">Book Now</button>
    `;
    container.appendChild(card);
  });
}

// === ENABLE SEARCH BAR + AUTOSUGGEST ===
function enableSearch() {
  const input = document.getElementById('searchInput');
  const suggestions = document.getElementById('suggestions');

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    suggestions.innerHTML = '';

    if (!query) {
      suggestions.style.display = 'none';
      renderMovies(allMovies);
      return;
    }

    const matched = allMovies.filter(movie =>
      movie.title.toLowerCase().includes(query)
    );

    if (matched.length === 0) {
      suggestions.style.display = 'none';
      return;
    }

    suggestions.style.display = 'block';

    matched.slice(0, 5).forEach(movie => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.style.cssText = `
        display: flex;
        align-items: center;
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
      `;

      item.innerHTML = `
        <img src="${movie.poster_url}" alt="${movie.title}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
        <span style="font-size: 14px;">${movie.title}</span>
      `;

      item.addEventListener('click', () => {
        input.value = movie.title;
        suggestions.innerHTML = '';
        suggestions.style.display = 'none';
        renderMovies([movie]);
      });

      suggestions.appendChild(item);
    });
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = input.value.trim().toLowerCase();
      suggestions.innerHTML = '';
      suggestions.style.display = 'none';

      if (!query) {
        renderMovies(allMovies);
        return;
      }

      const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(query)
      );

      renderMovies(filtered);
    }
  });

  document.addEventListener('click', (e) => {
    if (!suggestions.contains(e.target) && e.target !== input) {
      suggestions.style.display = 'none';
    }
  });
}

// === FLIP COMING SOON TICKET ===
function enableTicketFlip() {
  const ticket = document.getElementById('comingSoonTicket');
  const flipBtn = document.getElementById('flipBtn');

  if (ticket && flipBtn) {
    flipBtn.addEventListener('click', () => {
      ticket.classList.toggle('flipped');
    });
  }
}

// === PERSONALIZE HERO TITLE ===
function personalizeHero() {
  const params = new URLSearchParams(window.location.search);
  const urlName = params.get('name');
  const storedName = localStorage.getItem('username');
  const name = urlName || storedName || 'User';

  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    heroTitle.innerHTML = `Welcome <span>${name}</span> to <span>CINESPHERE</span>`;
  }
}

// === CLOSE NOTIFICATION BAR ===
function handleNotificationClose() {
  const closeBtn = document.getElementById('closeNotification');
  const notification = document.getElementById('notification');

  if (closeBtn && notification) {
    closeBtn.addEventListener('click', () => {
      notification.style.display = 'none';
    });
  }
}

// === NAVIGATION SCROLL & TICKET OPEN ===
function enableNavActions() {
  // 🟢 Scroll to now-showing
  document.getElementById('moviesLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('now-showing')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 🟡 Scroll to coming soon
  document.getElementById('comingSoonLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('coming-soon')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 🔵 Open sidebar to show tickets
  document.getElementById('ticketsLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    const sidebar = document.getElementById('accountSidebar');
    const content = document.getElementById('profileContent');
    const userId = localStorage.getItem('userId');

    if (!userId) {
      content.innerHTML = `<p>Please log in first.</p>`;
      sidebar.classList.add('active');
      return;
    }

    sidebar.classList.add('active');
    content.innerHTML = `
      <h3>🎟 My Bookings</h3>
      <div id="bookingList">Loading bookings...</div>
    `;

    // Reuse function from user_profile.js (or define it here if not globally available)
    if (typeof loadBookings === 'function') {
      loadBookings(userId);
    } else {
      fetch(`http://localhost:5000/user/bookings/${userId}`)
        .then(res => res.json())
        .then(tickets => {
          const list = document.getElementById('bookingList');
          if (!tickets || tickets.length === 0) {
            list.innerHTML = `<p>No tickets booked yet.</p>`;
            return;
          }

          list.innerHTML = tickets.map(ticket => `
            <div style="border:1px solid #ddd;padding:10px;margin-bottom:10px;">
              <p><strong>Movie:</strong> ${ticket.movie_title}</p>
              <p><strong>Theater:</strong> ${ticket.theater_name}</p>
              <p><strong>Date:</strong> ${ticket.date}</p>
              <p>Status: 
                <span style="color:${ticket.is_active ? 'green' : 'gray'}">
                  ${ticket.is_active ? 'Active' : 'Expired'}
                </span>
              </p>
            </div>
          `).join('');
        });
    }
  });
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  fetchNowShowingMovies();
  enableSearch();
  enableTicketFlip();
  personalizeHero();
  handleNotificationClose();
  enableNavActions();
});
