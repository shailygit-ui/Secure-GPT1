const express = require("express");
const cors = require("cors");

const scanPrompt = require("./scanner");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("SecureGPT Backend Running");
});

app.get("/test", (req,res)=>{

    const result = scanPrompt(
        "My password is admin123 and my API key is sk-abcdef"
    );

    res.json(result);
});

// app.post("/scan", (req,res)=>{

//     const prompt = req.body.prompt;

//     const result = scanPrompt(prompt);

//     res.json(result);
// });

app.post("/scan", (req, res) => {

    try {

        console.log("Received:", req.body);

        const prompt = req.body.prompt || "";

        const result = scanPrompt(prompt);

        console.log("Result:", result);

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

// app.get("/test", (req,res)=>{

//     const result = scanPrompt(
//         "My password is admin123 and my API key is sk-abcdef"
//     );

//     res.json(result);
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


