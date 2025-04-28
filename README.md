# AI Integration in JavaScript: Parse Natural Language to JSON with Node + React

### What We’re Building Today

Adding AI to your JavaScript app is easier than you think. We’ll leverage a LLM to read human-written input, but set it to reply into structured JSON. This way, your Node.js backend can easily parse and use the data.

As a practical example, our users describe a family and the App is going to generate a visual representation of the family's tree.

![](https://miro.medium.com/v2/resize:fit:1400/1*EWuigftlCZwS-tCoZ28Uxw.gif)

Current LLMs are so good that we can ask something like “**Give me the Simpsons family**”, it will generate **Homer**, **Margie**, **Bart**, **Lisa** and **Maggie**.
<p align="center">
  <img src="https://miro.medium.com/v2/resize:fit:1174/1*Y7_V_sldD-Xb5zYkwaN03Q.png" />
</p>

It also works with multiple idioms out of the box. Here is a Spanish request:

> **Elena está casada con Afonso, tienen 3 hijos y 5 nietos.**
<img width="607" alt="image" src="https://github.com/user-attachments/assets/de078970-1144-4e56-85fb-cdae2d5e1923" />

### The prompt

Getting consistent output from an LLM requires thoughtful prompt design. These are the prompt engineering principles I use most often:

*   **Specify the Format**  
    We explicitly instruct the LLM to respond in JSON format to ensure our app can parse the output cleanly.
*   **Provide Examples**  
    Always include at least two clear examples in your prompt. Edge cases are also welcome, that helps the AI to anticipate instead of getting confuse.
*   **Let the AI Improve Your Prompt**  
    Ask the LLM to refine your initial prompt. It often returns a more detailed version. This also helps verify you and the AI are aligned on the task.

Using those principles, I ended up with this prompt.
```
You are a family tree editor. You will receive instructions to modify a family tree in JSON format. Follow these rules:  
  
1\. Input format:  
{  
  "userMessage": "instruction to modify the tree",  
  "currentFamily": \[family members\]  
}  
  
2\. Family member format:  
{  
  "id": number,  
  "name": "string",  
  "gender": "male/female",  
  "mid?": mother\_id,  
  "fid?": father\_id,  
}  
  
3\. Processing rules:  
\- "mid" indicates mother's ID  
\- "fid" indicates father's ID  
\- For new members without names, generate realistic names  
\- Handle complex relationships (same parents can have multiple children, parents can have children with different partners)  
\- If any mentioned person doesn't exist, create them with appropriate relationships  
\- Assign new IDs sequentially (next available number)  
  
4\. Output rules:  
\- Return ONLY the updated JSON array of family members  
\- No explanations, commentary, or non-JSON text  
\- Maintain consistent JSON formatting  
\- Include all existing members plus new/changed ones  
  
Example input 1:  
{  
  "userMessage": "Add a son to Ava",  
  "currentFamily": \[  
    { "id": 1, "name": "Amber McKenzie", "gender": "female" },  
    { "id": 2, "name": "Ava Field", "gender": "male" },  
    { "id": 3, "mid": 1, "fid": 2, "name": "Peter Stevens", "gender": "male" }  
  \]  
}  
  
Example output 1:  
\[  
  { "id": 1, "name": "Amber McKenzie", "gender": "female" },  
  { "id": 2, "name": "Ava Field", "gender": "male" },  
  { "id": 3, "mid": 1, "fid": 2, "name": "Peter Stevens", "gender": "male" },  
  { "id": 4, "fid": 2, "name": "James Field", "gender": "male" }  
\]  
  
Example input 2:  
{  
  "userMessage": "Peter has a brother that is son of Mario",  
  "currentFamily": \[  
    { "id": 1, "name": "Amber McKenzie", "gender": "female" },  
    { "id": 2, "name": "Ava Field", "gender": "male" },  
    { "id": 3, "mid": 1, "name": "Peter Stevens", "gender": "male" }  
  \]  
}  
  
Example output 2:  
\[  
  { "id": 1, "name": "Amber McKenzie", "gender": "female" },  
  { "id": 2, "name": "Ava Field", "gender": "male" },  
  { "id": 3, "mid": 1, "name": "Peter Stevens", "gender": "male" },  
  { "id": 4, "name": "Mario", "gender": "male" },  
  { "id": 5, "mid": 1, "fid": 4, "name": "Michael", "gender": "male" }  
\]
```
### Choosing a Cost-Effective Model


AI services like OpenAI offer different models — some are super smart but expensive, others are simpler but much cheaper. You often don’t need the most powerful option.

For our family tree app, I tested a few models and found that "**_gpt-4.1-mini"_** is good enough, even being a lightweight version. You should try your prompt on different models and pick a cost-effective one, when possible.

### Connecting to the LLM

This is just an API call in which you will send the prompt, model and API key. OpenAI provides an **npm** package that wraps the request, so I am using it.
```javascript
const OpenAI = require('openai');  
const { instructions } = require('./instructions');  
  
const client = new OpenAI({  
    apiKey: process.env.OPENAI\_API\_KEY,  
});  
  
async function callOpenAI(userMessage, familyData) {  
    console.log(instructions);  
    const response = await client.responses.create({  
        model: 'gpt-4.1-mini',  
        input: \`  
            {  
                "userMessage": "${userMessage}",  
                "currentFamily": ${JSON.stringify(familyData)}  
            }  
        \`,  
        instructions: instructions  
    });  
    familyData = JSON.parse(response.output\_text);  
    return response.output\_text;  
}  
  
module.exports = { callOpenAI };
```
To avoid having the API key on client side, I coded this block on a Node backend app and used [dotenv](https://www.npmjs.com/package/dotenv) to inject my key to process object.

The prompt I described before, was saved on a separated file that we are importing as **instructions**. The **userMessage** is the "prompt" the user actually typed on the form. The real prompt sent to LLM is a long text messaged composed by all this elements and the current family data.

With that set, we can import **callOpenAI** on a controller. I am using [express](https://www.npmjs.com/package/express) to manage the API endpoint.
```
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
```

### Client side

On the front-end I started a blank project with [create-react-app](https://create-react-app.dev/docs/getting-started/). I added [FamilyTreeJS](https://github.com/BALKANGraph/FamilyTreeJS) for visual representation. For getting the updated family tree from our Node API, I did a simple [fetch](https://www.w3schools.com/jsref/api_fetch.asp) POST requesting sending the user message on the body. You can check the detailed implementation on the github repo bellow.
