import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
} from "react-native";
import axios from "axios";
import { useFonts } from "expo-font";
import * as Font from "expo-font";

const loadFonts = async () => {
  await Font.loadAsync({
    Papyrus: require("./assets/fonts/papyrus.ttf"),
  });
};

const AnimatedTitle = () => {
  const title = "MP3 Magic Converter".split("");
  const animValues = useRef(title.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      50,
      animValues.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        })
      )
    ).start();
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
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {letter === " " ? "\u00A0" : letter}
        </Animated.Text>
      ))}
    </View>
  );
};

const MagicButton = ({ onPress, isLoading, title }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 5, duration: 1000, useNativeDriver: false }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(floatAnim, { toValue: 2, friction: 5, useNativeDriver: false }).start();
  };

  const handlePressOut = () => {
    Animated.spring(floatAnim, { toValue: 0, friction: 5, useNativeDriver: false }).start();
  };

  return (
    <Animated.View style={[styles.buttonContainerFloat, { transform: [{ translateY: floatAnim }] }]}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={isLoading ? null : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MagicInput = ({ onChangeText, value, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderGlow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#4A90E2", "#D4AF37"],
  });

  return (
    <Animated.View style={[styles.inputContainer, { borderColor: borderGlow }]}>
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

const MagicLoader = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.loader, { transform: [{ rotate: spin }] }]}>
      <Text style={styles.loaderText}>✨</Text>
    </Animated.View>
  );
};

export default function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [videoTitle, setVideoTitle] = useState("magic_audio.mp3");
  const serverUrl = "http://26.27.56.35:5000";

  const [fontsLoaded] = useFonts({
    Papyrus: require("./assets/fonts/papyrus.ttf"),
  });

  if (!fontsLoaded) return null;

  const downloadMp3 = async () => {
    if (!url) {
      setStatus("Введи магическую ссылку!");
      return;
    }

    setIsLoading(true);
    setStatus("Взываем к древним силам...");

    try {
      const infoResponse = await axios.get(`${serverUrl}/info?url=${encodeURIComponent(url)}`);
      setVideoTitle(infoResponse.data.title || "magic_audio.mp3");

      setStatus("Преобразуем заклинание...");
      const response = await axios.post(
        `${serverUrl}/download`,
        { url },
        { responseType: "arraybuffer" }
      );

      setStatus("Портал открыт!");
      const blob = new Blob([response.data], { type: "audio/mp3" });
      const downloadUrl = window.URL.createObjectURL(blob);
      setDownloadUrl(downloadUrl);
    } catch (error) {
      setStatus(`Ошибка заклинания: ${error.message}`);
      console.error("Download error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    setUrl("");
    setStatus("Поле очищено магическим ветром");
    setDownloadUrl(null);
    setTimeout(() => setStatus(""), 1500);
  };

  return (
    <ImageBackground
      source={{ uri: "https://media.istockphoto.com/id/1405885287/video/nebula-background-loopable.jpg?s=640x640&k=20&c=B1RA_i39UxxFpMMUwutozU8cIPg1RYX5A2IOSBRqMZs=" }}
      style={styles.background}
    >
      <View style={styles.container}>
        <AnimatedTitle />
        <MagicInput
          onChangeText={setUrl}
          value={url}
          placeholder="Вставь ссылку на YouTube"
        />
        <View style={styles.buttonContainer}>
          <MagicButton onPress={downloadMp3} isLoading={isLoading} title="Преобразовать" />
          <MagicButton onPress={clearInput} isLoading={isLoading} title="Очистить" />
        </View>
        {isLoading && <MagicLoader />}
        {status && (
          <Animated.View style={styles.statusContainer}>
            <Text style={[styles.status, status.includes("Ошибка") ? styles.error : styles.success]}>
              {status}
            </Text>
          </Animated.View>
        )}
        {downloadUrl && (
          <Animated.View style={styles.downloadPortal}>
            <Text style={styles.portalText}>✨ Файл готов! ✨</Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => {
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = `${videoTitle}.mp3`;
                document.body.appendChild(link);
                link.click();
                setDownloadUrl(null);
              }}
            >
              <Text style={styles.downloadButtonText}>Скачать MP3</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(42, 27, 61, 0.8)",
  },
  titleContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontFamily: "Papyrus",
    color: "#D4AF37",
    textShadowColor: "rgba(212, 175, 55, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  inputContainer: {
    width: "95%", // Input длиннее
    borderWidth: 2,
    borderRadius: 20,
    marginBottom: 30,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Papyrus",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    marginBottom: 20,
  },
  buttonContainerFloat: {
    marginHorizontal: 15, // Больше пространства между кнопками
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#D4AF37",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: "#A3BFFA",
    borderColor: "#A0AEC0",
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Papyrus",
  },
  loader: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  loaderText: {
    fontSize: 30,
    color: "#D4AF37",
  },
  statusContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  status: {
    fontSize: 16,
    fontFamily: "Papyrus",
    color: "#FFFFFF",
    textAlign: "center",
  },
  error: {
    color: "#E53E3E",
  },
  success: {
    color: "#38A169",
  },
  downloadPortal: {
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: "rgba(42, 27, 61, 0.9)",
    borderWidth: 2,
    borderColor: "#D4AF37",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  portalText: {
    fontSize: 20,
    fontFamily: "Papyrus",
    color: "#D4AF37",
    textAlign: "center",
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  downloadButtonText: {
    color: "#2A1B3D",
    fontSize: 16,
    fontFamily: "Papyrus",
    textAlign: "center",
  },
});