import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";

export default function App() {
    const [url, setUrl] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  
    const downloadMp3 = async () => {
      if (!url) return setMessage("Введите ссылку на YouTube");
  
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Вставьте ссылку на YouTube"
          placeholderTextColor="#888"
          onChangeText={setUrl}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={isLoading ? null : downloadMp3}
          >
            <Text style={styles.buttonText}>Скачать MP3</Text>
          </TouchableOpacity>
        )}
        <Text
          style={[
            styles.message,
            message.includes("Ошибка") ? styles.error : styles.success,
          ]}
        >
          {message}
        </Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: 20,
    },
    input: {
      width: "80%",
      backgroundColor: "#f0f0f0",
      borderRadius: 10,
      padding: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#ccc",
    },
    button: {
      backgroundColor: "#007bff",
      padding: 10,
      borderRadius: 5,
    },
    buttonDisabled: {
      backgroundColor: "#ccc",
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontSize: 16,
    },
    message: {
      marginTop: 20,
      fontSize: 16,
    },
    error: {
      color: "red",
    },
    success: {
      color: "green",
    },
  });
