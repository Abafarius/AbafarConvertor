import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import axios from "axios";

// Компонент анимированного заголовка
const AnimatedTitle = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Запускаем бесконечную анимацию пульсации заголовка
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 1000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
      <Text style={styles.title}>🎵 MP3 Magic Downloader</Text>
    </Animated.View>
  );
};

// Компонент анимированной кнопки
const AnimatedButton = ({ onPress, isLoading, title }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, friction: 5, useNativeDriver: false }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: false }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={isLoading ? null : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Компонент поля ввода с анимацией фокуса
const AnimatedInput = ({ onChangeText, value, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Анимация изменения цвета границы при фокусе
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ddd", "#ff6f61"],
  });

  return (
    <Animated.View style={[styles.inputContainer, { borderColor }]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        onChangeText={onChangeText}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </Animated.View>
  );
};

// Компонент прогресс-бара
const ProgressBar = ({ progress }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Анимация ширины прогресс-бара
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressBar, { width }]} />
    </View>
  );
};

// Главный компонент приложения
export default function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const serverUrl = "http://26.27.56.35:5000"; // Адрес сервера

  // Функция скачивания MP3
  const downloadMp3 = async () => {
    if (!url) {
      setStatus("Пожалуйста, введите ссылку!");
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatus("Получаю информацию о видео...");

    try {
      // Запрос информации о видео
      const infoResponse = await axios.get(`${serverUrl}/info?url=${encodeURIComponent(url)}`);
      const videoTitle = infoResponse.data.title || "audio";

      setProgress(20);
      setStatus("Конвертирую видео в MP3...");

      // Запрос на скачивание
      const response = await axios.post(
        `${serverUrl}/download`,
        { url },
        { responseType: "arraybuffer" }
      );

      setProgress(60);
      setStatus("Скачиваю файл...");

      // Создание и скачивание файла
      const blob = new Blob([response.data], { type: "audio/mp3" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `${videoTitle}.mp3`);
      document.body.appendChild(link);
      link.click();

      setProgress(100);
      setStatus("Готово! Файл загружен.");
      setTimeout(() => {
        setStatus("");
        setProgress(0);
      }, 2000);
    } catch (error) {
      setStatus(`Ошибка: ${error.message}`);
      console.error("Download error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция очистки поля ввода
  const clearInput = () => {
    setUrl("");
    setStatus("Поле очищено");
    setProgress(0);
    setTimeout(() => setStatus(""), 1500);
  };

  return (
    <View style={styles.container}>
      <AnimatedTitle />
      <AnimatedInput
        onChangeText={setUrl}
        value={url}
        placeholder="Вставьте ссылку на YouTube"
      />
      <View style={styles.buttonContainer}>
        <AnimatedButton onPress={downloadMp3} isLoading={isLoading} title="Скачать" />
        <AnimatedButton onPress={clearInput} isLoading={isLoading} title="Очистить" />
      </View>
      {progress > 0 && <ProgressBar progress={progress} />}
      <Animated.View style={styles.statusContainer}>
        <Text style={[styles.status, status.includes("Ошибка") ? styles.error : styles.success]}>
          {status}
        </Text>
      </Animated.View>
    </View>
  );
}

// Стили приложения
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ff6f61",
    textShadow: "1px 1px 4px rgba(0, 0, 0, 0.2)",
  },
  inputContainer: {
    width: "90%",
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: "#fff",
    elevation: 5,
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff6f61",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginHorizontal: 10,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#ffb3ae",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  progressContainer: {
    width: "90%",
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ff6f61",
  },
  statusContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  status: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  error: {
    color: "#ff4444",
  },
  success: {
    color: "#00cc00",
  },
});