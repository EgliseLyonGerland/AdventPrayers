const translations: Record<string, string> = {
  male: "Homme",
  female: "Femme",
};

export default function t(key: string) {
  return translations[key] ?? key;
}
