const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const port = 5000;

// Настройка CORS для разрешения запросов с любого источника
app.use(cors({
  origin: '*',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type',
}));

// Парсинг JSON-запросов
app.use(express.json());

// Промисификация exec для асинхронного выполнения команд
const { promisify } = require('util');
const execPromise = promisify(exec);

// Функция для создания директории downloads, если она не существует
const ensureDownloadDirExists = () => {
  const dir = path.resolve(__dirname, 'downloads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Эндпоинт для получения информации о видео (название)
app.get("/info", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const command = `yt-dlp --get-title "${url}"`;
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error("YT-DLP Error:", stderr);
      return res.status(500).json({ error: "Failed to get video info", details: stderr });
    }

    const title = stdout.trim().replace(/[^\w\s-]/g, ''); // Удаляем спецсимволы из названия
    res.json({ title: title || "audio" });
  } catch (err) {
    console.error("Info Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Эндпоинт для скачивания MP3
app.post("/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const downloadDir = ensureDownloadDirExists();

    // Получение названия видео
    const infoCommand = `yt-dlp --get-title "${url}"`;
    const { stdout: titleStdout } = await execPromise(infoCommand);
    const videoTitle = titleStdout.trim().replace(/[^\w\s-]/g, '') || `audio_${Date.now()}`;
    const filename = `${videoTitle}.mp3`;
    const outputPath = path.join(downloadDir, filename);

    // Команда для скачивания и конвертации видео в MP3
    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;
    console.log("Executing command:", command);

    const { stdout, stderr } = await execPromise(command);

    console.log("STDOUT:", stdout);
    console.log("STDERR:", stderr);

    // Проверка на ошибки при выполнении команды
    if (stderr && !fs.existsSync(outputPath)) {
      console.error("YT-DLP Error:", stderr);
      return res.status(500).json({ error: "Download failed", details: stderr });
    }

    // Отправка файла клиенту
    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error("File sending error:", err);
        return res.status(500).json({ error: "File send failed", details: err.message });
      }

      console.log("File sent successfully:", filename);

      // Удаление файла после отправки
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting file:", unlinkErr);
        } else {
          console.log("File deleted:", filename);
        }
      });
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://26.27.56.35:${port}`);
});