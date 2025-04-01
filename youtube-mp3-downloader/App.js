import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import axios from "axios";
import * as FileSystem from "expo-file-system";

export default function App() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  const downloadMp3 = async () => {
    if (!url) return setMessage("Введите ссылку на YouTube");

    try {
      const response = await axios.post("http://26.27.56.35:5000/download", { url }, { responseType: "blob" });

      const fileUri = FileSystem.documentDirectory + "downloaded_audio.mp3";
      await FileSystem.writeAsStringAsync(fileUri, response.data, { encoding: FileSystem.EncodingType.Base64 });

      setMessage("Файл загружен!");
    } catch (error) {
      setMessage("Ошибка загрузки");
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
