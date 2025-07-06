document.getElementById('userForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const full_name = document.getElementById('full_name').value;
  const email = document.getElementById('email').value;

  const res = await fetch('http://localhost:3000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, email })
  });

  if (res.ok) {
    alert('User added successfully!');
    fetchUsers();
  }
});

async function fetchUsers() {
  const res = await fetch('http://localhost:3000/api/users');
  const users = await res.json();
  const list = document.getElementById('userList');
  list.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.full_name + " (" + user.email + ")";
    list.appendChild(li);
  });
}

fetchUsers();