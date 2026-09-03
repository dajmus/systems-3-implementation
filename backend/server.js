const express = require('express');
const cors = require('cors');
const path = require('path');
const accountsRouter = require('./routes/accounts');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/accounts', accountsRouter);
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/prescriptions', require('./routes/prescriptions'));

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
