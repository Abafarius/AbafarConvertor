const { exec } = require("child_process");

app.post("/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const filename = `audio_${Date.now()}.mp3`;
    const outputPath = `./downloads/${filename}`;

    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;

    console.log("Executing command:", command);

    exec(command, (error, stdout, stderr) => {
      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);

      if (error) {
        console.error("YT-DLP Error:", stderr);
        return res.status(500).json({ error: "Download failed", details: stderr });
      }

      res.download(outputPath, filename, (err) => {
        if (err) {
          console.error("File sending error:", err);
          return res.status(500).json({ error: "File send failed", details: err.message });
        }

        console.log("File sent successfully:", filename);
        setTimeout(() => fs.unlink(outputPath, () => {}), 30000);
      });
    });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});
