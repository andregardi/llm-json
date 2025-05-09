const OpenAI = require('openai');
const { instructions } = require('./instructions');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function callOpenAI(userMessage, currentFamily) {
    console.log(instructions);
    const response = await client.responses.create({
        model: 'gpt-4.1-mini',
        input: `
            {
                "userMessage": "${userMessage}",
                "currentFamily": ${JSON.stringify(currentFamily)}
            }
        `,
        instructions: instructions
    });
    familyData = JSON.parse(response.output_text);
    return response.output_text;
}

module.exports = { callOpenAI };