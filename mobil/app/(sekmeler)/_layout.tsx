import { Tabs } from "expo-router";
import Glif from "~/bilesen/Glif";
import { R } from "~/lib/tema";

const simge = (ad: string) =>
  function S({ color }: { color: unknown }) {
    return <Glif ad={ad} boyut={26} renk={String(color)} kalinlik={2} />;
  };

export default function Sekmeler() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: R.yazi,
        tabBarInactiveTintColor: "#AEAEB2",
        tabBarStyle: { backgroundColor: R.zemin, borderTopColor: R.cizgi },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Yol", tabBarIcon: simge("gitar") }} />
      <Tabs.Screen name="teori" options={{ title: "Teori", tabBarIcon: simge("kitap") }} />
      <Tabs.Screen name="sarkilar" options={{ title: "Şarkılar", tabBarIcon: simge("nota") }} />
      <Tabs.Screen name="defter" options={{ title: "Defter", tabBarIcon: simge("takvim") }} />
    </Tabs>
  );
}
