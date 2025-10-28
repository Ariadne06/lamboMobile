import React, { useMemo, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking,
} from "react-native";

const RESIDENT_FORGOT_API =
  "https://lambo-web-5mka.onrender.com/authentication/api/forgot_password/";
const RESOLVE_ACCOUNT_TYPE_API =
  "https://lambo-web-5mka.onrender.com/authentication/api/resolve_account_type/";
const PERSONNEL_RESET_PAGE =
  "https://lambo-web-5mka.onrender.com/authentication/req_pwd_change/";

export default function ForgotPasswordScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState<"personnel"|"resident"|"unknown"|"error"|"pending">("pending");

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const canSubmit = username.trim().length > 0 && emailValid && !loading;

  async function openPersonnelPage() {
    const ok = await Linking.canOpenURL(PERSONNEL_RESET_PAGE);
    if (!ok) return Alert.alert("Can't open link", "Unable to open the staff reset page.");
    await Linking.openURL(PERSONNEL_RESET_PAGE);
  }

  async function onSubmit() {
    if (!username.trim() || !email.trim()) {
      return Alert.alert("Missing Info", "Both username and email are required.");
    }
    if (!emailValid) {
      return Alert.alert("Invalid Email", "Please enter a valid email address.");
    }

    setLoading(true);
    setDetected("pending");

    // 1) Resolve account type via your SP-backed endpoint
    let acct: "personnel" | "resident" | "unknown" = "unknown";
    try {
      console.log("POST →", RESOLVE_ACCOUNT_TYPE_API, { username: username.trim(), email: email.trim() });
      const res = await fetch(RESOLVE_ACCOUNT_TYPE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim() }),
      });
      const text = await res.text();
      console.log("Resolver status =", res.status, "body =", text);
      let data: any = {};
      try { data = JSON.parse(text); } catch {}
      if (res.ok && (data?.account_type === "personnel" || data?.account_type === "resident" || data?.account_type === "unknown")) {
        acct = data.account_type;
      } else {
        setDetected("error");
      }
    } catch (e) {
      console.log("[resolve_account_type] network error:", e);
      setDetected("error");
    }

    setDetected(acct);

    // 2) If personnel (or conflict mapped to personnel) → open staff page
    if (acct === "personnel") {
      try {
        await openPersonnelPage();
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3) Otherwise, resident API (safe default)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      console.log("POST →", RESIDENT_FORGOT_API, { username: username.trim(), email: email.trim() });
      const res = await fetch(RESIDENT_FORGOT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim() }),
        signal: controller.signal,
      });

      const ct = res.headers.get("content-type") || "";
      let payload: any = null;

      if (ct.includes("application/json")) {
        payload = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) throw new Error(text.slice(0, 200) || "Server returned an error.");
        payload = { message: text };
      }

      if (!res.ok) throw new Error(payload?.error || "Failed to send reset email");

      Alert.alert("Success", "If a matching resident account exists, a reset link has been sent.");
    } catch (e: any) {
      if (e.name === "AbortError") {
        Alert.alert("Timeout", "Request took too long. Please try again.");
      } else {
        Alert.alert("Error", e.message ?? "Failed to send reset email");
      }
    } finally {
      setLoading(false);
      controller.abort();
      clearTimeout(timer);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#111" }}>
        Forgot Password
      </Text>

      {/* Debug indicator so you can SEE what the resolver decided (remove later) */}
      <Text style={{ color: "#6b7280", marginBottom: 12 }}>Detected: {detected}</Text>

      <TextInput
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 12, backgroundColor: "#fff" }}
        editable={!loading}
      />

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: email.length === 0 || emailValid ? "#d1d5db" : "#ef4444", borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 24, backgroundColor: "#fff" }}
        editable={!loading}
      />

      <TouchableOpacity
        onPress={onSubmit}
        disabled={!canSubmit}
        style={{ backgroundColor: canSubmit ? "#FF3D33" : "#9ca3af", padding: 15, borderRadius: 8, alignItems: "center" }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
