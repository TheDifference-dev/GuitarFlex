// Metro: masaüstü kaynaklarını (../src) paylaşır, ama her paketi YALNIZ mobil/node_modules'tan çözer
// (iki React kopyası olmasın). Masaüstüne özgü birkaç modül mobil köprüleriyle değiştirilir.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const MOBIL = __dirname;
const KOK = path.resolve(MOBIL, "..");
const config = getDefaultConfig(MOBIL);

config.watchFolders = [path.join(KOK, "src")];
config.resolver.nodeModulesPaths = [path.join(MOBIL, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

// Masaüstü modülü → mobil köprüsü
const KOPRU = {
  "next/link": path.join(MOBIL, "kopru", "next-link.tsx"),
  "@/lib/progress": path.join(MOBIL, "lib", "ilerleme.ts"),
};
const onceki = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (KOPRU[moduleName]) return { type: "sourceFile", filePath: KOPRU[moduleName] };
  return (onceki ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
