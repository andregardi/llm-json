// server/controllers/openAiController.js
const { callOpenAI } = require('../services/open-ai');

const handleOpenAiRequest = async (req, res) => {
    try {
        const { prompt, familyData } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!familyData) {
            return res.status(400).json({ error: 'Family data is required' });
        }
        
        const response = await callOpenAI(prompt, familyData);
        res.json({ response });
    } catch (error) {
        console.error('Error processing OpenAI request:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};

module.exports = { handleOpenAiRequest };