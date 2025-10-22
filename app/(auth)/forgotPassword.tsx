import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

// Change this to your backend base
const API_URL = "https://lambo-web-5mka.onrender.com/authentication/api/forgot_password/";
//const API_URL = "http://10.162.93.189:8000/authentication/api/forgot_password/";
// If you're using Android emulator, use:  "http://10.0.2.2:8000/authentication/api/forgot_password/"
// If iOS simulator on macOS: "http://localhost:8000/authentication/api/forgot_password/"

export default function ForgotPasswordScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const canSubmit = username.trim().length > 0 && emailValid && !loading;

  async function onSubmit() {
    if (!username.trim() || !email.trim()) {
      return Alert.alert("Missing Info", "Both fields are required.");
    }
    if (!emailValid) {
      return Alert.alert("Invalid Email", "Please enter a valid email address.");
    }

    setLoading(true);

    // Abort after 15s
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
        }),
        signal: controller.signal,
      });

      const ct = res.headers.get("content-type") || "";

      // Try to parse JSON ONLY if response is JSON
      let payload: any = null;
      if (ct.includes("application/json")) {
        payload = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) {
          // HTML / text error page — show first chars to avoid the `<` JSON error
          throw new Error(text.slice(0, 200) || "Server returned an error.");
        } else {
          // Not JSON but OK status — treat as success
          payload = { message: text };
        }
      }

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to send reset email");
      }

      Alert.alert("Success", "Check your email for the reset link.");
    } catch (e: any) {
      if (e.name === "AbortError") {
        Alert.alert("Timeout", "Request took too long. Please try again.");
      } else {
        Alert.alert("Error", e.message ?? "Failed to send reset email");
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#111" }}>
        Forgot Password
      </Text>

      <TextInput
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          padding: 15,
          fontSize: 16,
          marginBottom: 12,
          backgroundColor: "#fff",
        }}
        editable={!loading}
      />

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: email.length === 0 || emailValid ? "#d1d5db" : "#ef4444",
          borderRadius: 8,
          padding: 15,
          fontSize: 16,
          marginBottom: 24,
          backgroundColor: "#fff",
        }}
        editable={!loading}
      />

      <TouchableOpacity
        onPress={onSubmit}
        disabled={!canSubmit}
        style={{
          backgroundColor: canSubmit ? "#FF3D33" : "#9ca3af",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            Send reset email
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
