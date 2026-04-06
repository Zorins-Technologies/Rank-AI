require("dotenv").config({ path: "c:\\Users\\Mir Faisal Ali\\Desktop\\faisal\\Rank AI\\backend\\.env" });
const https = require("https");

const apiKey = "AIzaSyDCzLmU2FvzwEfWaUmz3BHjixuC6qGrE70"; // Using identified key directly for one-time verification

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

const body = JSON.stringify({
  contents: [{ parts: [{ text: "Write a one-sentence catchphrase for Rank AI, an SEO blog tool." }] }]
});

const req = https.request(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  }
}, (res) => {
  let data = "";
  res.on("data", (c) => data += c);
  res.on("end", () => {
    try {
      const result = JSON.parse(data);
      if (result.error) {
        console.error("API Error:", result.error.message);
      } else {
        console.log("--- GENERATION SUCCESS ---");
        console.log(result.candidates[0].content.parts[0].text);
      }
    } catch (e) {
      console.error("Parse Error:", e.message);
      console.log("Raw:", data);
    }
  });
});

req.on("error", (e) => console.error(e.message));
req.write(body);
req.end();
