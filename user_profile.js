document.addEventListener('DOMContentLoaded', () => {
  const accountBtn = document.getElementById('accountLink');
  const sidebar = document.getElementById('accountSidebar');
  const content = document.getElementById('profileContent');

  accountBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    sidebar.classList.add('active');

    const email = localStorage.getItem('email');
    const userId = localStorage.getItem('userId');

    if (!email || !userId) {
      content.innerHTML = `<p>Please log in first.</p>`;
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/user/profile/${encodeURIComponent(email)}`);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();

      content.innerHTML = `
        <h3>👤 Profile Info</h3>
        <p><strong>Name:</strong> ${data.username}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Role:</strong> ${data.role}</p>

        <hr>
        <h3>🔐 Change Password</h3>
        <input type="password" id="oldPass" placeholder="Current Password"><br>
        <input type="password" id="newPass" placeholder="New Password"><br>
        <button onclick="verifyAndUpdatePassword()">Update Password</button>
        <div id="passMsg" style="color:red;margin-top:5px;"></div>

        <hr>
        <h3>🎟 My Bookings</h3>
        <div id="bookingList">Loading bookings...</div>
      `;

      loadBookings(userId);
    } catch (err) {
      content.innerHTML = `<p style="color:red;">❌ ${err.message}</p>`;
    }
  });
});

function closeProfileSidebar() {
  document.getElementById('accountSidebar').classList.remove('active');
}

// 🔐 Password change logic
function verifyAndUpdatePassword() {
  const email = localStorage.getItem('email');
  const currentInput = document.getElementById('oldPass');
  const newPassInput = document.getElementById('newPass');
  const current = currentInput.value.trim();
  const newPass = newPassInput.value.trim();
  const msgDiv = document.getElementById('passMsg');

  if (!email || !current || !newPass) {
    msgDiv.innerText = "❌ Please fill all fields.";
    msgDiv.style.color = "red";
    return;
  }

  fetch('http://localhost:5000/user/verify-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, currentPass: current })
  })
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        fetch('http://localhost:5000/user/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPass })
        })
          .then(r => r.text())
          .then(msg => {
            msgDiv.style.color = 'green';
            msgDiv.innerText = msg;

            // ✅ Clear inputs after success
            currentInput.value = '';
            newPassInput.value = '';
          });
      } else {
        msgDiv.style.color = "red";
        msgDiv.innerText = "❌ Wrong current password";

        // ✅ Clear current password field for re-entry
        currentInput.value = '';
        newPassInput.value = '';
      }
    })
    .catch(() => {
      msgDiv.style.color = "red";
      msgDiv.innerText = "❌ Error verifying password";

      // ✅ Clear both on error too
      currentInput.value = '';
      newPassInput.value = '';
    });
}


// 🎟 Load bookings
function loadBookings(userId) {
  const list = document.getElementById('bookingList');

  if (!userId) {
    list.innerHTML = `<p>User ID missing. Please log in again.</p>`;
    return;
  }

  fetch(`http://localhost:5000/user/bookings/${userId}`)
    .then(async res => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      return res.json();
    })
    .then(tickets => {
      if (!tickets || tickets.length === 0) {
        list.innerHTML = `<p>No tickets booked yet.</p>`;
        return;
      }

      list.innerHTML = tickets.map(ticket => `
        <div style="border:1px solid #ddd;padding:10px;margin-bottom:10px;border-radius:5px;">
          <p><strong>Movie:</strong> ${ticket.movie_title}</p>
          <p><strong>Theater:</strong> ${ticket.theater_name}</p>
          <p><strong>Date:</strong> ${ticket.date || ticket.booking_time || 'N/A'}</p>
          <p>Status: 
            <span style="color:${ticket.is_active ? 'green' : 'gray'}">
              ${ticket.is_active ? 'Active' : 'Expired'}
            </span>
          </p>
        </div>
      `).join('');
    })
    .catch(err => {
      list.innerHTML = `<p style="color:red;">❌ ${err.message}</p>`;
    });
}
