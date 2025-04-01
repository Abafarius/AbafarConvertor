import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import axios from "axios";

export default function App() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  const downloadMp3 = async () => {
    if (!url) return setMessage("Введите ссылку на YouTube");

    try {
      const response = await axios.post("http://26.27.56.35:5000/download", { url }, { responseType: "arraybuffer" });

      // Преобразуем бинарные данные в Blob
      const blob = new Blob([response.data], { type: "audio/mp3" });

      // Для веба создаем ссылку для скачивания
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "downloaded_audio.mp3");
      document.body.appendChild(link);
      link.click();

      setMessage("Файл загружен!");
    } catch (error) {
      setMessage("Ошибка загрузки");
      console.error("Download error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Вставьте ссылку на YouTube" onChangeText={setUrl} />
      <Button title="Скачать MP3" onPress={downloadMp3} />
      <Text>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  input: { width: "80%", borderBottomWidth: 1, marginBottom: 10, padding: 5 },
});
