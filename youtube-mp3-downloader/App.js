import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import axios from "axios";

// Компонент анимированного заголовка с появлением букв
const AnimatedTitle = () => {
  const title = "MP3 Magic Downloader".split(""); // Разбиваем заголовок на буквы
  const animValues = useRef(title.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Создаём последовательность анимаций для каждой буквы
    const animations = animValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 50, // Задержка для последовательного появления
        useNativeDriver: false,
      })
    );
    Animated.stagger(50, animations).start();
  }, []);

  return (
    <View style={styles.titleContainer}>
      {title.map((letter, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.title,
            {
              opacity: animValues[index],
              transform: [
                {
                  translateY: animValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0], // Плавное появление снизу вверх
                  }),
                },
              ],
            },
          ]}
        >
          {letter === " " ? "\u00A0" : letter} {/* Пробелы как неразрывные */}
        </Animated.Text>
      ))}
    </View>
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

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#CBD5E0", "#F5A623"], // От серого к золотистому
  });

  return (
    <Animated.View style={[styles.inputContainer, { borderColor }]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
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

  useEffect(() => {
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

  const downloadMp3 = async () => {
    if (!url) {
      setStatus("Пожалуйста, введите ссылку!");
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatus("Получаю информацию о видео...");

    try {
      const infoResponse = await axios.get(`${serverUrl}/info?url=${encodeURIComponent(url)}`);
      const videoTitle = infoResponse.data.title || "audio";

      setProgress(20);
      setStatus("Конвертирую видео в MP3...");

      const response = await axios.post(
        `${serverUrl}/download`,
        { url },
        { responseType: "arraybuffer" }
      );

      setProgress(60);
      setStatus("Скачиваю файл...");

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

// Стили с новой цветовой палитрой
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8ECEF", // Светло-серый фон
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A90E2", // Синий для заголовка
  },
  inputContainer: {
    width: "90%",
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: "#FFFFFF",
    elevation: 5,
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: "#2D3748", // Тёмно-серый текст
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4A90E2", // Синий для кнопок
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginHorizontal: 10,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#A3BFFA", // Светло-синий для отключённых кнопок
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  progressContainer: {
    width: "90%",
    height: 10,
    backgroundColor: "#CBD5E0", // Серый фон прогресс-бара
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#F5A623", // Золотистый прогресс
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
    color: "#2D3748", // Тёмно-серый текст статуса
  },
  error: {
    color: "#E53E3E", // Красный для ошибок
  },
  success: {
    color: "#38A169", // Зелёный для успеха
  },
});