// src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const axios = require('axios'); 
const cors = require('cors');
const path = require('path');
const dotenv = require("dotenv");
const readline = require("readline");
const { Anthropic } = require('@anthropic-ai/sdk');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const { callChatGPT, callGemini, callMistral } = require("./services/chatService");
const { saveChatData } = require("./services/dbService");

dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;
`const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});`

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemiAni-1.5-flash" });

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const upload = multer({
    dest: uploadDir, // Save files in the 'uploads' directory
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed.'));
        }
    }
});

const app = express();
const PORT = process.env.PORT || 3002;

const dbConfig = {
    user: 'sa',
    password: 'W2GWU@SQL99!',
    server: '103.108.14.244',
    database: 'escandb',
    options: {
        encrypt: true, 
        trustServerCertificate: true
    }
};

// Create a connection pool
let connectionPool;
(async () => {
    try {
        connectionPool = await sql.connect(dbConfig);
        //console.log('Connected to SQL Server');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
})();


app.use(cors());

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username == "superadmin@escanav.com" && password == "escanai")
    {
        res.status(200).json({ message: 'Admin Verified', username: '' });
    }
    else 
    {

    try {
        const authUrl = `https://www.escanav.com/sales/imapauth.aspx?uname=${username}&pass=${password.replace("'", "''")}`;
        const response = await axios.get(authUrl);

        //console.log(authUrl);

        console.log(response.data);

        if (response.data.includes('$ OK completed')) {
            const sessionId = await sql.query`INSERT INTO chat_sessions (username) OUTPUT INSERTED.session_id VALUES (${username})`;
            res.status(200).json({ message: 'Login successful', sessionId: sessionId.recordset[0].session_id, username: username });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).send('Error during authentication');
    }
}
});

app.get('/newchat', async (req, res) => {
    const { username } = req.query;
    try {
        const sessionId = await sql.query`INSERT INTO chat_sessions (username) OUTPUT INSERTED.session_id VALUES (${username})`;
        console.log('sessionId :', sessionId);
        res.status(200).json({ sessionId: sessionId.recordset[0].session_id });
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).send('Error during authentication');
    }
});

app.get('/getInsights', async (req, res) => {
    try {

        const result = await sql.query`
            WITH 
TotalUsage AS (
    SELECT SUM(usage_total_tokens) AS totalusage
    FROM messages
),
ActiveSessions AS (
    SELECT COUNT(session_id) AS activesessions
    FROM chat_sessions
    
),
TotalUsers AS (
    SELECT COUNT(distinct username) AS users
    FROM chat_sessions
),
AvgTokensPerSession AS (
    SELECT AVG(session_tokens) AS avg_tokens_per_session
    FROM (
        SELECT session_id, SUM(usage_total_tokens) AS session_tokens
        FROM messages
        GROUP BY session_id
    ) AS session_data
)
SELECT 
    tu.totalusage,
    asess.activesessions,
    tusers.users,
    avg.avg_tokens_per_session
FROM 
    TotalUsage tu, 
    ActiveSessions asess, 
    TotalUsers tusers, 
    AvgTokensPerSession avg;`;
          

        // Format the results as needed by the frontend
        const chatHistory = result.recordset.map(record => ({
            totalusage: record.totalusage,
            activesessions: record.activesessions,
            users: record.users,
            sessions: record.avg_tokens_per_session
        }));

        res.status(200).json(chatHistory);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

const getTokenUsage = async (username) => {
    if (!connectionPool) {
      throw new Error("Database connection not established");
    }
  
    try {
      const result = await connectionPool
        .request()
        .input("username", sql.VarChar, username)
        .query(`
            SELECT 
            top 1 total.used, 
            cs.maxtokens as limit,
                CASE 
                    WHEN COALESCE(total.used, 0) > cs.maxtokens THEN 'true'
                ELSE 'false'
                    END AS lock
            FROM chat_sessions cs
            LEFT JOIN (
                SELECT username, SUM(usage_total_tokens) AS used 
                FROM messages 
                WHERE username = @username
                GROUP BY username
            ) AS total ON cs.username = total.username
            WHERE cs.username = @username;
        `);
  
      return result.recordset[0] || { used: 0, limit: 0, lock: false };
    } catch (error) {
      console.error("Database query error:", error);
      throw new Error("Database query failed");
    }
};
  
app.get("/api/token-usage", async (req, res) => {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
  
    try {
      const data = await getTokenUsage(username);
      console.log('Usage Data:', data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.get('/getrecent', async (req, res) => {

    try {

        const result = await sql.query`
            select top 1 a.*, b.* from chat_sessions a left join messages b 
            on a.session_id = b.session_id
            order by b.id desc`;
          

        // Format the results as needed by the frontend
        const chatHistory = result.recordset.map(record => ({
            userMessage: record.content,
            aiMessage: record.response,
            username: record.username,
            tokens: record.usage_total_tokens,
            model: record.model,
            time: record.created_at[1]
        }));

        res.status(200).json(chatHistory);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

app.post('/setlimit', async (req, res) => {
    const { username, maxtokens } = req.body; // Get username and maxtokens from request body

    if (!username || isNaN(maxtokens) || maxtokens <= 0) {
        return res.status(400).json({ message: 'Invalid username or token limit' });
    }

    try {
        // Update maxtokens for the given username
        const result = await sql.query`
            UPDATE chat_sessions 
            SET maxtokens = ${maxtokens}
            WHERE username = ${username}`;

        if (result.rowsAffected[0] > 0) {
            return res.status(200).json({ message: `Token limit updated for ${username}` });
        } else {
            return res.status(404).json({ message: 'User not found or no update required' });
        }
    } catch (error) {
        console.error('Error updating token limit:', error);
        res.status(500).json({ message: 'Error updating token limit' });
    }
});

app.get('/getusers', async (req, res) => {

    try {

        const result = await sql.query`
            WITH TopUser AS (
    SELECT TOP 100 
        username, 
        COUNT(CASE WHEN response IS NOT NULL THEN 1 END) AS response_count, 
        SUM(usage_total_tokens) AS tokens
    FROM messages
    GROUP BY username
    ORDER BY tokens DESC
)
SELECT  
    tu.username, 
    tu.tokens, 
    MAX(cs.maxtokens) AS maxtokens,
    MAX(cs.logout_time) AS logout_time
FROM chat_sessions cs
JOIN TopUser tu
ON cs.username = tu.username
WHERE cs.logout_time IS NOT NULL
GROUP BY tu.username, tu.tokens
ORDER BY logout_time DESC;`;
          

        // Format the results as needed by the frontend
        const chatHistory = result.recordset.map(record => ({
            username: record.username,
            tokens: record.tokens,
            limit: record.maxtokens,
            logout: record.logout_time
        }));

        //console.log(result);

        //console.log(chatHistory);

        res.status(200).json(chatHistory);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

app.get('/getTopUser', async (req, res) => {


    try {

        const result = await sql.query`
            WITH TopUser AS (
    SELECT TOP 1 username, 
           COUNT(CASE WHEN response IS NOT NULL THEN 1 END) AS response_count, 
           SUM(usage_total_tokens) AS tokens
    FROM messages
    GROUP BY username
    ORDER BY tokens DESC
)
SELECT 
    tu.username, 
    tu.response_count, 
    tu.tokens, 
    COUNT(cs.session_id) AS highusage
FROM chat_sessions cs
JOIN TopUser tu
ON cs.username = tu.username
GROUP BY tu.username, tu.response_count, tu.tokens;`;
          

        // Format the results as needed by the frontend
        const chatHistory = result.recordset.map(record => ({
            username: record.username,
            responsecount: record.response_count,
            tokens: record.tokens,
            sessions: record.highusage
        }));

        //console.log('result: ', result);

        //console.log('chathistory: ', chatHistory);

        res.status(200).json(chatHistory);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});


app.get('/getchat', async (req, res) => {
    const { sessionId } = req.query;

    try {
        const result = await sql.query`
            SELECT content, response, branchIndex
            FROM messages
            WHERE session_id = ${sessionId}
            ORDER BY branchIndex ASC, created_at ASC`;

        // Group messages by branchIndex
        const conversations = result.recordset.reduce((acc, record) => {
            const { branchIndex, content, response } = record;

            if (!acc[branchIndex]) {
                acc[branchIndex] = [];
            }

            acc[branchIndex].push({
                userMessage: content,
                aiMessage: response
            });

            return acc;
        }, {});

        console.log('Conversations:', conversations);
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});


app.get('/logout', async (req, res) => {
    const { username } = req.query;

    //console.log(username);

    try {
        // Query the prompts table for the given session_id
        /*const result = await sql.query`
        UPDATE gptlogin 
        SET logout_time = GETUTCDATE()
        WHERE session_id = ${sessionId}`;*/

        const result = await sql.query`
  UPDATE chat_sessions 
  SET logout_time = GETUTCDATE()
  WHERE username = ${username} and logout_time is null`;

        
        if (result.rowsAffected[0] > 0) {
            //console.log(`Logout time updated successfully for session ID: ${username}`);
        } else {
            //console.log(`No matching session ID found for: ${username}`);
        }

        res.status(200).json({ message: 'Error fetching chat history' });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

app.get('/getprompts', async (req, res) => {

    try {
     
const totalprompts = await sql.query`
  SELECT 
    totalprompt - failedprompt AS completed, 
    failedprompt, 
    totalprompt
  FROM 
    (SELECT COUNT(content) AS totalprompt FROM messages) AS total,
    (SELECT COUNT(content) AS failedprompt FROM messages WHERE response LIKE '%Request failed with%') AS failed`;


        const tprompt = totalprompts.recordset.map(record => record.totalprompt);
        const cprompt = totalprompts.recordset.map(record => record.completed);
        const fprompt = totalprompts.recordset.map(record => record.failedprompt);

        const result = { Total:tprompt, Completed: cprompt, Failed: fprompt }
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

app.get('/getActiveS', async (req, res) => {

    try {
        // Query the prompts table for the given session_id
       /* const sessions = await sql.query`
            select totals, actives 
from 
(select count(*) as totals from gptlogin) as total,
(select count(*) as actives from gptlogin where logout_time IS NULL) as active

`;*/

const sessions = await sql.query`
  SELECT totals, actives
  FROM 
    (SELECT COUNT(*) AS totals FROM chat_sessions) AS total,
    (SELECT COUNT(*) AS actives FROM chat_sessions WHERE logout_time IS NULL) AS active`;


/*const Users = await sql.query`
            select distinct username as users
from gptlogin

`;*/

const Users = await sql.query`
  SELECT DISTINCT username AS users
  FROM chat_sessions`;


        const totals = sessions.recordset.map(record => record.totals);
        const actives = sessions.recordset.map(record => record.actives);
        const activeu = Users.recordset.map(record => record.users);
        const result = { Total:totals, Active: actives, Users: activeu, NoU : Users.rowsAffected }
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

app.get('/deletecontent', async (req, res) => {
    const { username } = "js@escanav.com";
    const session = "9E96F97C-2E5E-4D15-9CBD-569124B11B43";
    try {

        const sessionsResult = await sql.query`
        Delete
        FROM messages 
        WHERE session_id = ${session}`;

        console.log(sessionsResult)

        res.status(200).json(sessionsResult);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

app.get('/getsessions', async (req, res) => {
    const { username } = req.query;

    try {
        const sessionsResult = await sql.query`
        SELECT TOP 20 session_id, content, response 
        FROM messages 
        WHERE username = ${username} AND content IS NOT NULL
        ORDER BY created_at DESC`;

        const uniqueSessions = new Set();
        const chatHistoryBySession = [];

        for (const record of sessionsResult.recordset) {
            if (!uniqueSessions.has(record.session_id)) {
                uniqueSessions.add(record.session_id);
                chatHistoryBySession.push({
                    sessionId: record.session_id,
                    prompt: record.content
                });
            }
        }

        console.log('chatHistoryBySession:', chatHistoryBySession);
        res.status(200).json(chatHistoryBySession);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

app.post('/analyze-document', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    try {
        let fileContent = '';

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        // Detect file type
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(dataBuffer);
            fileContent = pdfData.text.trim(); // Extracted text from PDF
        } else {
            fileContent = fs.readFileSync(req.file.path, 'utf-8');
        }

        console.log('fileContent: ', fileContent);

        // If extracted content is empty, return an error message
        if (!fileContent) {
            return res.status(400).json({ message: "Unable to extract meaningful text from the document." });
        }

        const analysis = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Analyze this document and summarize key points clearly and concisely." },
                { role: "user", content: fileContent }
            ],
        });

        console.log('analysis :', analysis.choices[0].message.content);

        res.json({ summary: analysis.choices[0].message.content });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        // Cleanup: Delete uploaded file after processing
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
        });
    }
});

app.post("/callAI", async (req, res) => {
    try {
        const { history, sessionId, branchindex, username, model } = req.body;

        console.log("Incoming request:", JSON.stringify(req.body, null, 2));

        // Validation: Ensure history is an array of non-empty strings
        if (
            !Array.isArray(history) || 
            history.length === 0
        ) {
            return res.status(400).json({ message: "Invalid request: 'history' must be a non-empty array of valid strings." });
        }

        // Validation: Ensure branchindex is a valid integer
        const branchIndexInt = parseInt(branchindex, 10);
        if (isNaN(branchIndexInt)) {
            return res.status(400).json({ message: "Invalid request: 'branchindex' must be a valid integer." });
        }

        // Validation: Ensure sessionId and username are provided
        if (!sessionId || !username) {
            console.error("Missing sessionId or username:", req.body);
            return res.status(400).json({ message: "Missing required fields: 'sessionId' and 'username' are mandatory." });
        }

        // Validate AI model selection
        const supportedModels = ["gpt", "gemini", "mistral"];
        if (!supportedModels.includes(model)) {
            return res.status(400).json({ message: `Invalid AI model specified. Supported models: ${supportedModels.join(", ")}` });
        }

        // Check user's token usage
        let tokenUsage;
        try {
            tokenUsage = await getTokenUsage(username);
        } catch (tokenError) {
            console.error("Error fetching token usage:", tokenError);
            return res.status(500).json({ message: "Internal error: Unable to retrieve token usage." });
        }

        // Check if user is locked due to exceeding token limit
        if (tokenUsage.lock === "true") {
            return res.status(429).json({ message: "Token limit exceeded. Upgrade your plan or wait before making more requests." });
        }

        let aiResponse;
        try {
            switch (model) {
                case "gpt":
                    aiResponse = await callChatGPT(history);
                    break;
                case "gemini":
                    aiResponse = await callGemini(history);
                    break;
                case "mistral":
                    aiResponse = await callMistral(history);
                    break;
            }
        } catch (aiError) {
            console.error("AI Model Call Failed:", aiError);
            if (sessionId) {
                await saveChatData(sessionId, "user", branchIndexInt, history, username, "AI service error", 0, 0, model);
            }
            return res.status(500).json({ message: "AI model failed to respond. Try again later." });
        }

        console.log("AI Response:", aiResponse);

        // Validate AI response
        if (!aiResponse || !aiResponse.result) {
            return res.status(500).json({ message: "AI returned an empty response." });
        }

        // Extract token usage
        const promptTokens = aiResponse.usagePromptTokens || 0;
        const completionTokens = aiResponse.usageCompletionTokens || 0;
        const totalTokens = promptTokens + completionTokens;

        // Check if the AI response exceeds the remaining token limit
        const remainingTokens = tokenUsage.limit - tokenUsage.used;
        if (totalTokens > remainingTokens) {
            return res.status(429).json({ message: "AI response exceeds token limit. Try a shorter request or upgrade your plan." });
        }

        // Save chat data
        try {
            await saveChatData(
                sessionId,
                "user",
                branchIndexInt,
                history,
                username,
                aiResponse.result,
                promptTokens,
                completionTokens,
                aiResponse.model
            );
        } catch (dbError) {
            console.error("Error saving chat data:", dbError);
            return res.status(500).json({ message: "Internal error: Unable to save chat history." });
        }

        return res.status(200).json({ message: "Success", result: aiResponse.result });

    } catch (error) {
        console.error("Unexpected Server Error:", error);

        // Log the error to the database only if sessionId exists
        try {
            if (sessionId) {
                await saveChatData(sessionId, "user", branchindex, history, username, error.message, 0, 0, "error");
            }
        } catch (logError) {
            console.error("Error logging to database:", logError);
        }

        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



app.get('/testgpt', async (req, res) => {
    const openai = new OpenAI({
        apiKey: apiKey,
    });

   /* const moderation = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: "' UNION SELECT 1,2,3,4 --UNION SELECT username, password FROM users --'",
    });
    
    console.log(moderation);*/


    /*const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "What's in this image?" },
                    {
                        type: "image_url",
                        image_url: {
                            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
                        },
                    }
                ],
            },
        ],
        store: true,
    });
    
    console.log(completion.choices[0].message);*/
});

app.post('/claudeai', async (req, res) => {
    const { history, sessionId, userId, username } = req.body;

    if (!Array.isArray(history)) {
        return res.status(400).json({ message: "History must be an array" });
    }

    try {
        // Prepare messages for Claude AI
        const messages = []; // Initialize messages array
        history.forEach(message => {
            if (message.userMessage) messages.push({ role: "user", content: message.userMessage });
            if (message.aiMessage) messages.push({ role: "assistant", content: message.aiMessage });
        });

        // Add the latest user message to the array
        if (history[history.length - 1].userMessage) {
            messages.push({ role: "user", content: history[history.length - 1].userMessage });
        }

        // Log messages array for debugging
        console.log('Final messages array:', messages);

        // Make the Claude AI API call
        const completion = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022", // Use the correct model
            max_tokens: 1024,
            messages: messages, // Use the prepared messages
        });

        console.log(completion);



        // Extract the response content and usage details
        const result = completion.choices[0].message.content;
        const usageTotalTokens = completion.usage.total_tokens; // Adjusted for Claude AI

        // Get current UTC time
        const timestamp = new Date().toISOString();

        // Serialize history for database insertion
        const historyJson = JSON.stringify(history);

        // Store the prompt, response, and additional details in the database
        await sql.query`
            INSERT INTO messages 
            (session_id, role, content, username, response, created_at, usage_prompt_tokens, usage_completion_tokens, model) 
            VALUES 
            (${sessionId}, 'user', ${historyJson}, ${username}, ${result}, ${timestamp}, ${usageTotalTokens}, 0, 'claude') // Adjusted for Claude AI
        `;

        // Send a JSON response
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            message: 'Success',
            result: result
        });

    } catch (error) {
        // Handle error gracefully
        const errorMessage = error.response ? error.response.data : error.message;

        // Log and store the error for debugging purposes
        console.error("Error calling Claude AI API:", errorMessage);

        const timestamp = new Date().toISOString();
        await sql.query`
            INSERT INTO messages 
            (session_id, role, content, username, response, created_at, usage_prompt_tokens, usage_completion_tokens, model) 
            VALUES 
            (${sessionId}, 'user', ${JSON.stringify(history)}, ${username}, ${errorMessage}, ${timestamp}, 0, 0, 'error')
        `;

        // Send a JSON response in case of error
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({
            message: 'Error calling Claude AI API',
            error: errorMessage
        });
    }
});

// Gracefully shut down the server and close the connection pool
process.on('SIGINT', async () => {
    try {
        await connectionPool.close();
        //console.log('Connection pool closed');
        process.exit(0);
    } catch (err) {
        console.error('Error closing the connection pool:', err);
        process.exit(1);
    }
});

app.listen(3002, () => {
    console.log(`Server is running on http://localhost:3002`);
});
