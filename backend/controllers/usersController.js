const db = require('../db');

exports.createUser = (req, res) => {
  const { full_name, email, phone_number, address, user_type } = req.body;

  // First insert user into users table
  const insertUserQuery = 'INSERT INTO users (full_name, email) VALUES (?, ?)';
  db.query(insertUserQuery, [full_name, email], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Failed to insert user.' });
    }

    const userId = result.insertId;

    // Decide which table to insert phone and address info into
    if (user_type === 'donor') {
      const insertDonorQuery = 'INSERT INTO donors (user_id, phone_number, address) VALUES (?, ?, ?)';
      db.query(insertDonorQuery, [userId, phone_number, address], (err2) => {
        if (err2) {
          console.error('Error inserting donor:', err2);
          return res.status(500).json({ error: 'Failed to insert donor info.' });
        }
        return res.status(201).json({ message: 'Donor user created', userId });
      });
    } else if (user_type === 'collector') {
      const insertReceiverQuery = 'INSERT INTO receivers (user_id, phone_number, address) VALUES (?, ?, ?)';
      db.query(insertReceiverQuery, [userId, phone_number, address], (err2) => {
        if (err2) {
          console.error('Error inserting receiver:', err2);
          return res.status(500).json({ error: 'Failed to insert receiver info.' });
        }
        return res.status(201).json({ message: 'Collector user created', userId });
      });
    } else {
      // If user_type not donor or collector, just respond with success but no extra info
      return res.status(201).json({ message: 'User created without donor/receiver info', userId });
    }
  });
};

exports.getAllUsers = (req, res) => {
  const query = `
    SELECT u.user_id, u.full_name, u.email,
      d.phone_number AS donor_phone, d.address AS donor_address,
      r.phone_number AS receiver_phone, r.address AS receiver_address
    FROM users u
    LEFT JOIN donors d ON u.user_id = d.user_id
    LEFT JOIN receivers r ON u.user_id = r.user_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users.' });
    }

    const users = results.map(user => {
      let user_type = null;
      let phone_number = null;
      let address = null;

      if (user.donor_phone !== null) {
        user_type = 'donor';
        phone_number = user.donor_phone;
        address = user.donor_address;
      } else if (user.receiver_phone !== null) {
        user_type = 'collector';
        phone_number = user.receiver_phone;
        address = user.receiver_address;
      }

      return {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        user_type,
        phone_number,
        address,
      };
    });

    res.json(users);
  });
};
