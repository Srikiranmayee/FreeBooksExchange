const express = require('express');
const cors = require('cors');
const app = express();
const usersRoutes = require('./routes/users');
const booksRoutes = require('./routes/books');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRoutes);
app.use('/api/books', booksRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});