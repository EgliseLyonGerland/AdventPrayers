const translations: Record<string, string> = {
  male: "Homme",
  female: "Femme",
  firstName: "Prénom",
  lastName: "Nom",
  age: "Tranche d’age",
  gender: "Genre",
  email: "Adresse email",
  bio: "Bio",
};

export default function t(key: string) {
  return translations[key] ?? key;
}
