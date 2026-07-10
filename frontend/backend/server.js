require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const mongoose = require("mongoose");
const connectDB = require("./db");
const Agreement = require("./models/agreement");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

connectDB();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========================
// CREATE UPLOADS FOLDER
// =========================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// =========================
// MULTER STORAGE
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
});

// =========================
// HOME ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// =========================
// TEST OPENAI
// =========================
app.get("/test-openai", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      messages: [
        {
          role: "user",
          content: "Say Hello",
        },
      ],
    });

    res.json({
      success: true,
      result: completion.choices[0].message.content,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// PDF UPLOAD + EXTRACT TEXT
// =========================
app.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    // Delete the temporary file to keep the server clean
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      fileName: req.file.originalname,
      extractedText: pdfData.text,
    });
  } catch (error) {
    console.log(error);

    // Clean up file if an error occurs mid-process
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// EXTRACT FORM DATA (AUTO-FILL)
// =========================
app.post("/api/extract", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    const mimeType = req.file.mimetype;
    const filePath = req.file.path;
    let extractionContent = [];

    // Intelligently handle PDFs vs Images
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractionContent = [
        {
          type: "text",
          text: `Extract the form data from this document text:\n\n${pdfData.text}`,
        },
      ];
    } else if (mimeType.startsWith("image/")) {
      const base64Image = fs.readFileSync(filePath).toString("base64");
      extractionContent = [
        {
          type: "text",
          text: "Extract the form data from this document image.",
        },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64Image}` },
        },
      ];
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Please upload a PDF or Image.",
      });
    }

    // Using a model capable of JSON responses and Vision (gpt-4o) with strict rules
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a highly precise legal document data extractor. 
          
          CRITICAL INSTRUCTIONS:
          1. PROPERTY ADDRESS: Extract the ENTIRE, complete property address word-for-word same to same address which is given below SCHEDULE OF THE FLAT do not change anything & DO NOT ADD THIS  (hereinafter referred the “Said Flat”)and which the said flat is bounded as follows that is to say..
          2. TITLES: For every person, strictly extract their prefix/title (e.g., "Mr.", "Mrs.", "Shri", "Smt.", "Ms.","miss.") into the "title" field.
          3. MULTIPLE PARTIES: Scan the entire document. If there are 2, 3, or more sellers/purchasers, you MUST extract ALL of them and add them as separate objects inside the "sellers" and "purchasers" arrays.
          4. buildingAddress: take only Plot No. ,Sector No. , & place name 

          Return a STRICT JSON object mapping EXACTLY to these keys:
          {
            "placeOfExecution": "",
            "societyName": "",
            "flatNo": "",
            "buildingAddress": "",
            "propertyAddress": "",
            "shareCertificateNumber": "",
            "shareDistinctiveFrom": "",
            "shareDistinctiveTo": "",
            "totalConsideration": "",
            "bankName": "",
            "sellerAddress": "",
            "purchaserAddress": "",
            "sellers": [{"title": "", "name": "", "age": "", "pan": ""}],
            "purchasers": [{"title": "", "name": "", "age": "", "pan": ""}]
          }
          If a specific value is not found, leave the string empty (""). Only return valid JSON.`,
        },
        {
          role: "user",
          content: extractionContent,
        },
      ],
      temperature: 0.1, // Strict mode
    });

    // Delete the temporary file to keep the server clean
    fs.unlinkSync(filePath);

    const extractedData = JSON.parse(response.choices[0].message.content);
    res.json(extractedData);
  } catch (error) {
    console.error("Extraction API Error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Failed to process document for auto-fill",
    });
  }
});

// =========================
// EXTRACT PROPERTY HISTORY
// =========================
app.post("/extract-history", async (req, res) => {
  try {
    const { pdfText } = req.body;

    if (!pdfText) {
      return res
        .status(400)
        .json({ success: false, message: "No text provided." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      messages: [
        {
          role: "system",
          content:
            "You are a Maharashtra Property Agreement and CIDCO Property Documentation Expert.",
        },
        {
          role: "user",
          content: `
You are a Senior Maharashtra Property Documentation Advocate and Conveyancing Expert.

ABSOLUTE INSTRUCTION:

You must draft the Ownership History in the EXACT SAME drafting style, recital style, wording pattern, sentence structure, paragraph length and legal language appearing in the previous ownership history contained in the uploaded document.

DO NOT rewrite the history in your own language.

DO NOT modernize the drafting.

DO NOT summarize.

DO NOT make clauses significantly longer or shorter.

DO NOT create large AI-generated paragraphs.

DO NOT substantially change the wording.

You must preserve the same recital drafting style and make only those minor changes that are strictly necessary to reflect the facts of each ownership transaction.

The objective is:

If the previous ownership history in the document contains clauses drafted as:

"AND WHEREAS by an Agreement to Lease dated..."

"AND WHEREAS the said Society has allotted..."

"AND WHEREAS by a Gift Deed dated..."

Then the generated ownership history must follow the exact same wording style, legal terminology, recital structure, paragraph size and sentence construction.

IMPORTANT:

The generated clauses should read as if they were drafted by the same advocate who drafted the previous ownership history appearing in the document.

STRICT DRAFTING REQUIREMENTS:

1. Extract ONLY title history and ownership affecting events.

2. Extract EVERY SINGLE ownership transaction appearing anywhere in the document.

3. Do NOT skip any ownership event.

4. Every ownership event must be drafted as one separate recital clause.

5. Leave one complete blank line between every recital clause.

6. Maintain strict chronological order beginning from the earliest ownership record and ending with the latest ownership transaction.

7. Return only clean recital clauses.

8. Do not return headings.

9. Do not return explanations.

10. Do not return notes.

11. Do not return summaries.

12. Do not return title investigation remarks.

13. Preserve approximately the same paragraph size as the previous ownership history appearing in the document.

14. Preserve approximately the same sentence length.

15. Preserve the same recital pattern.

16. Preserve the same legal phraseology.

17. Preserve the same usage of expressions such as:

"AND WHEREAS"

"the said Premises"

"hereinafter referred to as"

"for brevity's sake"

"right, title and interest"

"occupancy and other rights"

"on the terms and conditions as contained in"

and similar expressions wherever applicable.

18. Repeat complete property particulars only where the previous history follows such practice.

19. Do not unnecessarily repeat facts that were not repeated in the previous history.

20. Make only minimal wording changes required by the facts extracted from the document.

STRICTLY EXCLUDE:

Do NOT reproduce:

* CIDCO incorporation clauses
* Government acquisition clauses
* Statutory background clauses
* Definitions and interpretation clauses
* Explanatory clauses not affecting title
* General background recitals not affecting ownership

EXTRACT ONLY OWNERSHIP HISTORY.

For every ownership event separately identify and mention, wherever available:

A. Nature of transaction:

* Original CIDCO allotment
* Agreement to Lease
* Lease Deed
* Society Formation
* Society Registration
* Society Allotment
* Membership Transfer
* Share Certificate issuance
* Nomination
* Death of member
* Legal Heirship
* Probate
* Succession
* Gift Deed
* Release Deed
* Relinquishment Deed
* Family Settlement
* Partition
* Assignment Deed
* Transfer Deed
* Agreement for Sale
* Sale Deed
* Conveyance Deed
* Court Orders
* CIDCO Permissions
* Society Transfer Approvals
* Any other ownership affecting document

B. Parties involved.

C. Document particulars.

D. Property particulars.

E. Society particulars.

F. Rights transferred.

VERY IMPORTANT:

The uploaded document itself MUST ALWAYS be treated as one separate ownership history event if it records, confirms, transfers, assigns, releases, gifts, inherits, conveys or otherwise affects title.

The uploaded document itself must always be included as the LAST ownership history recital.

For the recital relating to the uploaded document itself:

* Mention the exact nature and type of document executed.
* Mention execution date.
* Mention registration date.
* Mention registration number.
* Mention registration office.
* Mention all outgoing parties.
* Mention all incoming parties.
* Mention complete property particulars wherever mentioned.
* Mention share particulars wherever mentioned.
* Mention membership particulars wherever mentioned.
* Mention the rights transferred under the document.

DO NOT mention:

* Sale consideration amount
* Purchase price
* Monetary consideration
* Stamp duty amount
* Registration charges
* Payment terms
* Mode of payment

OUTPUT FORMAT:

Return ONLY ownership history recital clauses.

Leave one complete blank line between every recital clause.

The wording, style, recital pattern, paragraph size and legal language must closely resemble the previous ownership history appearing in the uploaded document.

The generated history should read as though it has been copied from and drafted by the same person who drafted the earlier ownership history and should require little or no manual editing.

ADDITIONAL INSTRUCTIONS:

Wherever available in the uploaded document, every ownership history recital must also specifically mention:

* TNN No.
* Registration Receipt No.
* Registration Date
* Registration Office
* Document Number
* Registration Number
* Sub-Registrar Office

For every ownership affecting document, if the above particulars are available, incorporate them naturally within the recital clause in the same drafting style followed in the previous ownership history.

Example drafting style:

"AND WHEREAS by a Gift Deed dated 02.11.2019, entered into between Mr. A and Mr. B and registered with the Sub-Registrar, Thane-8, on 02.11.2019 under Document No. TNN-8-15365-2019, Registration Receipt No. ______, TNN No. ______, the Donor transferred his right, title and interest in respect of the said Premises in favour of the Donee..."

Similarly, wherever an Agreement for Sale, Assignment Deed, Transfer Deed, Conveyance Deed, Sale Deed, Release Deed, Probate, Succession document, Family Settlement or any other title affecting document is mentioned, also include:

* TNN No.
* Registration Receipt No.
* Registration Date
* Registration Office

if such particulars are available in the document.

SALE CONSIDERATION:

Unlike the earlier instructions, if the document mentions the consideration amount for a particular ownership affecting transaction, also mention:

* Total consideration amount in letters also
* Sale consideration in letters also
* Purchase pricein letters also
* Transfer consideration in letters also

in the recital clause, in the same manner and wording style used in the previous ownership history appearing in the document.

Do not create or assume these particulars.

Mention them only if they are expressly available in the uploaded document.

Preserve the exact drafting style, paragraph size, recital pattern and wording of the previous ownership history and make only minimal changes necessary to incorporate these particulars.


AGREEMENT TEXT:

${pdfText}
`,
        },
      ],
      temperature: 0,
    });

    res.json({
      success: true,
      history: completion.choices[0].message.content,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// AI CLAUSE ASSISTANT CHATBOT
// =========================
app.post("/api/ai-clause", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, message: "No prompt provided." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      messages: [
        {
          role: "system",
          content:
            "You are a highly skilled legal assistant specializing in Maharashtra property law, conveyancing, and agreement drafting. Your job is to rephrase, correct grammar, or draft new clauses professionally based on the user's request. Ensure formal legal terminology is used. Return ONLY the finalized text of the clause without any conversational filler.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2, // Lower temperature keeps the AI focused and formal
    });

    res.json({
      success: true,
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.log("AI Clause Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// SAVE DRAFT
// =========================
app.post("/api/save-draft", async (req, res) => {
  try {
    const agreement = await Agreement.create(req.body);

    res.json({
      success: true,
      agreement,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// GET ALL DRAFTS OF USER
// =========================
app.get("/api/drafts/:uid", async (req, res) => {
  try {
    const drafts = await Agreement.find({
      userId: req.params.uid,
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      drafts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// GET SINGLE DRAFT
// =========================
app.get("/api/draft/:id", async (req, res) => {
  try {
    const draft = await Agreement.findById(req.params.id);

    res.json({
      success: true,
      draft,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// UPDATE DRAFT
// =========================
app.put("/api/draft/:id", async (req, res) => {
  try {
    const draft = await Agreement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      success: true,
      draft,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// DELETE DRAFT
// =========================
app.delete("/api/drafts/:id", async (req, res) => {
  try {
    const deletedDraft = await Agreement.findByIdAndDelete(req.params.id);

    if (!deletedDraft) {
      return res
        .status(404)
        .json({ success: false, message: "Draft not found" });
    }

    res.json({
      success: true,
      message: "Draft deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
