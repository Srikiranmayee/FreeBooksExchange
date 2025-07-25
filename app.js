let user = null;
let userRole = 'donor';
let books = JSON.parse(localStorage.getItem('books') || '[]');
let requests = JSON.parse(localStorage.getItem('requests') || '[]');
let requestedBooks = new Set();

function onSignIn(response) {
  const payload = JSON.parse(atob(response.credential.split('.')[1]));
  user = {
    name: payload.name,
    email: payload.email
  };

  document.getElementById('user-name').textContent = user.name;
  document.getElementById('login-area').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');

  switchRole('donor');
  renderBooks();
}

function signOut() {
  google.accounts.id.disableAutoSelect();
  location.reload();
}

function switchRole(role) {
  userRole = role;

  document.getElementById('donor-tab').classList.remove('active');
  document.getElementById('collector-tab').classList.remove('active');
  document.getElementById(`${role}-tab`).classList.add('active');

  document.querySelectorAll('.role-panel').forEach(panel => panel.classList.add('hidden'));
  document.getElementById(`${role}-panel`).classList.remove('hidden');

  renderBooks();
  if (role === 'donor') renderDonorRequests();
}

function uploadBook() {
  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const address = document.getElementById('book-address').value.trim();

  if (!title || !author || !address) {
    alert("Please fill all fields.");
    return;
  }

  books.push({ title, author, address, donor: user.email });
  localStorage.setItem('books', JSON.stringify(books));
  alert("✅ Book uploaded!");
  document.getElementById('book-title').value = '';
  document.getElementById('book-author').value = '';
  document.getElementById('book-address').value = '';
  renderBooks();
}

function renderBooks() {
  const list = document.getElementById('book-list');
  if (!list) return;

  const query = document.getElementById('search-box')?.value.toLowerCase() || '';
  list.innerHTML = '';

  books
    .filter(b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query))
    .forEach((book, index) => {
      const card = document.createElement('div');
      card.className = "bg-white shadow rounded-lg p-4";

      card.innerHTML = `
        <h3 class="text-lg font-bold">${book.title}</h3>
        <p class="text-gray-700">Author: ${book.author}</p>
        <p class="text-gray-600">📍 ${book.address}</p>
      `;

      if (userRole === 'collector') {
        const isRequested = requests.some(r => r.bookIndex === index && r.requester === user.email);
        const button = document.createElement('button');
        button.textContent = isRequested ? "Requested ✅" : "Request Book";
        button.disabled = isRequested;
        button.className = `mt-2 px-4 py-2 rounded text-white ${isRequested ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`;
        button.onclick = () => requestBook(index);
        card.appendChild(button);
      }

      list.appendChild(card);
    });
}

function requestBook(index) {
  const book = books[index];

  if (requests.some(r => r.bookIndex === index && r.requester === user.email)) {
    alert("You've already requested this book.");
    return;
  }

  requests.push({
    bookIndex: index,
    requester: user.email,
    status: "pending"
  });

  localStorage.setItem('requests', JSON.stringify(requests));
  alert(`📬 Request sent to donor: ${book.donor}`);
  renderBooks();
}

function renderDonorRequests() {
  const container = document.getElementById('donor-requests');
  container.innerHTML = '';

  const myRequests = requests.filter(r => books[r.bookIndex]?.donor === user.email);

  if (myRequests.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No requests received yet.</p>';
    return;
  }

  myRequests.forEach((req, i) => {
    const book = books[req.bookIndex];
    const div = document.createElement('div');
    div.className = 'bg-gray-50 p-4 border rounded';

    div.innerHTML = `
      <p><strong>${book.title}</strong> requested by <span class="text-blue-600">${req.requester}</span></p>
      <p>Status: ${req.status === 'accepted' ? '<span class="text-green-600 font-semibold">Accepted</span>' : 'Pending'}</p>
    `;

    if (req.status === 'pending') {
      const btn = document.createElement('button');
      btn.textContent = "Accept Request";
      btn.className = 'mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600';
      btn.onclick = () => acceptRequest(i);
      div.appendChild(btn);
    }

    container.appendChild(div);
  });
}

function acceptRequest(reqIndex) {
  requests[reqIndex].status = "accepted";
  localStorage.setItem('requests', JSON.stringify(requests));
  renderDonorRequests();
}

