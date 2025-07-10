# Welcome to our LAMBO Mobile Application 👋

---

## 🚀 Get Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```

---

## 🔐 Supabase Setup

This project is preconfigured to use Supabase for backend services like authentication and database access.

1. Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL='your_supabase_url'
   EXPO_PUBLIC_SUPABASE_ANON_KEY='your_supabase_anon_key'
   ```

---

## 💅 NativeWind (Tailwind CSS for React Native)

This app uses [NativeWind](https://www.nativewind.dev/) to style components with Tailwind CSS classes.

- Use `className="..."` on React Native components.
- Configured via `tailwind.config.js` and `nativewind.config.ts`.

**Example:**

```tsx
<View className="flex-1 items-center justify-center bg-blue-100">
  <Text className="text-red-600 text-lg font-bold">Hello from NativeWind!</Text>
</View>
```

---

## 📁 Routing with Expo Router

This project uses **Expo Router** for file-based routing. Folder structure inside `app/` determines your screens.

- `app/index.tsx` → Home screen
- `app/(tabs)/explore.tsx` → Explore tab
- `app/details/[id].tsx` → Dynamic route

📘 Learn more at [https://expo.github.io/router/docs](https://expo.github.io/router/docs)

---

## 🧼 Reset Starter App

To remove demo files and start fresh:

```bash
npm run reset-project
```

This moves current demo files to `app-example/` and gives you a clean `app/` directory.

---
