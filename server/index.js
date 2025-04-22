const cors = require('cors');
const express = require('express');
require('dotenv').config()

const { handleOpenAiRequest } = require('./controllers/openAiController');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/openai', handleOpenAiRequest);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});