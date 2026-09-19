require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.post("/api/answer", async (req, res) => {
  try {
    const { question, role, resume } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const systemPrompt = `
You are an interview preparation assistant.

Generate a concise, natural answer that a candidate can use for interview practice.

Candidate profile:
${resume || "MBA Finance and Business Analytics fresher"}

Target role:
${role || "Finance / Business Analyst"}

Rules:
- Answer the exact question.
- Use simple professional English.
- Keep the answer easy to speak.
- Avoid complicated vocabulary.
- Do not invent experience, companies, achievements, or qualifications.
- If the question asks about experience and the candidate is a fresher, clearly frame the answer around education, projects, internships, skills, or transferable knowledge.
- Give a direct answer first.
- Prefer 4-6 short speaking points.
- For technical questions, explain the concept and give a simple example.
- For behavioral questions, use STAR structure when appropriate.
- Do not mention that you are an AI.
`;

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      instructions: systemPrompt,
      input: question.trim()
    });

    res.json({
      answer: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to generate answer"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Parakeet AI running at http://localhost:${PORT}`);
});
