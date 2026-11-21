import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { yukle } from "~/lib/ilerleme";
import { R } from "~/lib/tema";

export default function Kok() {
  useEffect(() => {
    yukle();
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTintColor: R.mavi, headerTitleStyle: { color: R.yazi }, contentStyle: { backgroundColor: R.zemin }, headerBackTitle: "Geri" }}>
        <Stack.Screen name="(sekmeler)" options={{ headerShown: false }} />
        <Stack.Screen name="ders/[kurs]/[id]" options={{ title: "" }} />
        <Stack.Screen name="adim/[yol]/[kod]" options={{ title: "" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
