let user = null;
let userRole = null;
let books = JSON.parse(localStorage.getItem('books') || '[]');

function onSignIn(response) {
  const credential = response.credential;
  const payload = JSON.parse(atob(credential.split('.')[1]));
  user = {
    name: payload.name,
    email: payload.email
  };
  document.getElementById('user-name').innerText = user.name;
  document.getElementById('login-area').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  renderBooks();
}

function signOut() {
  google.accounts.id.disableAutoSelect();
  location.reload();
}

function setRole(role) {
  userRole = role;
  if (role === 'donor') {
    document.getElementById('donor-panel').style.display = 'block';
  } else {
    document.getElementById('donor-panel').style.display = 'none';
  }
}

function uploadBook() {
  const title = document.getElementById('book-title').value;
  const author = document.getElementById('book-author').value;
  const address = document.getElementById('book-address').value;

  if (title && author && address) {
    books.push({ title, author, address, donor: user.email });
    localStorage.setItem('books', JSON.stringify(books));
    renderBooks();
    alert('Book uploaded!');
  }
}

function renderBooks() {
  const list = document.getElementById('book-list');
  list.innerHTML = '';
  books.forEach((book, index) => {
    const li = document.createElement('li');
    li.className = 'bg-white shadow p-4 rounded-lg mb-4';
    li.innerHTML = `
      <h3 class="text-lg font-bold">${book.title}</h3>
      <p class="text-gray-700">Author: ${book.author}</p>
      <p class="text-gray-600">📍 ${book.address}</p>
    `;
    if (userRole === 'collector') {
      li.innerHTML += `
        <button class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onclick="requestBook(${index})">
          Request Book
        </button>
      `;
    }
    list.appendChild(li);
  });
}


function searchBooks() {
  const query = document.getElementById('search-box').value.toLowerCase();
  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
  );
  const list = document.getElementById('book-list');
  list.innerHTML = '';
  filtered.forEach((book, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${book.title}</b> by ${book.author} - 📍 ${book.address}`;
    if (userRole === 'collector') {
      li.innerHTML += ` <button onclick="requestBook(${index})">Request Pickup</button>`;
    }
    list.appendChild(li);
  });
}

function requestBook(index) {
  const book = books[index];
  alert(`✅ Request sent to ${book.donor}\n📍 Collect from: ${book.address}`);
}
