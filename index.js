const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');  // Импортируем CORS

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:8081',  // Разрешаем доступ только с этого источника
}));
  // Включаем CORS для всех запросов
app.use(express.json());

const { promisify } = require('util');
const execPromise = promisify(exec);

const ensureDownloadDirExists = () => {
  const dir = path.resolve(__dirname, 'downloads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

app.post("/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const downloadDir = ensureDownloadDirExists();
    const filename = `audio_${Date.now()}.mp3`;
    const outputPath = path.join(downloadDir, filename);

    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;

    console.log("Executing command:", command);

    try {
      const { stdout, stderr } = await execPromise(command);

      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);

      if (stderr) {
        console.error("YT-DLP Error:", stderr);
        return res.status(500).json({ error: "Download failed", details: stderr });
      }

      res.download(outputPath, filename, (err) => {
        if (err) {
          console.error("File sending error:", err);
          return res.status(500).json({ error: "File send failed", details: err.message });
        }

        console.log("File sent successfully:", filename);

        fs.unlink(outputPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting file:", unlinkErr);
          } else {
            console.log("File deleted:", filename);
          }
        });
      });
    } catch (err) {
      console.error("Error during command execution:", err);
      res.status(500).json({ error: "Internal server error during download", details: err.message });
    }

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
