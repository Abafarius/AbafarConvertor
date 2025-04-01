const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/download", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Invalid URL" });

    const outputPath = path.join(__dirname, "downloads", `${Date.now()}.mp3`);

    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: "Download failed" });

        res.download(outputPath, "audio.mp3", () => {
            console.log("Download complete!");
        });
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));
