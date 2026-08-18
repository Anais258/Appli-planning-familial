import type { Category } from "../api/types";

export interface AgeTaskSuggestion {
  title: string;
  category: Category;
  recurring: boolean;
  duration: number;
}

export interface AgeBracket {
  key: string;
  label: string;
  min: number;
  max: number;
  tasks: AgeTaskSuggestion[];
}

// Consolidated from common parenting guidance (Naître et grandir, CIUSSS
// Capitale-Nationale, GoHenry, Focus on the Family) — a starting point to
// tweak per family, not a rulebook.
export const AGE_BRACKETS: AgeBracket[] = [
  {
    key: "2-3",
    label: "2-3 ans",
    min: 2,
    max: 3,
    tasks: [
      { title: "Ranger ses jouets", category: "Maison", recurring: true, duration: 10 },
      { title: "Mettre son linge sale dans le panier", category: "Maison", recurring: true, duration: 5 },
      { title: "Se laver les mains avant/après le repas", category: "Santé", recurring: true, duration: 5 },
    ],
  },
  {
    key: "4-5",
    label: "4-5 ans",
    min: 4,
    max: 5,
    tasks: [
      { title: "Mettre la table (avec aide)", category: "Maison", recurring: true, duration: 10 },
      { title: "Débarrasser son assiette", category: "Maison", recurring: true, duration: 5 },
      { title: "Nourrir l'animal de compagnie", category: "Maison", recurring: true, duration: 10 },
      { title: "S'habiller seul", category: "Santé", recurring: true, duration: 10 },
    ],
  },
  {
    key: "6-7",
    label: "6-7 ans",
    min: 6,
    max: 7,
    tasks: [
      { title: "Mettre la table seul", category: "Maison", recurring: true, duration: 10 },
      { title: "Essuyer table et plan de travail", category: "Maison", recurring: true, duration: 10 },
      { title: "Ranger le linge propre", category: "Maison", recurring: true, duration: 15 },
      { title: "Balayer une pièce", category: "Maison", recurring: true, duration: 15 },
      { title: "Se brosser les dents seul", category: "Santé", recurring: true, duration: 5 },
    ],
  },
  {
    key: "8-9",
    label: "8-9 ans",
    min: 8,
    max: 9,
    tasks: [
      { title: "Laver/essuyer la vaisselle", category: "Maison", recurring: true, duration: 15 },
      { title: "Sortir les poubelles", category: "Maison", recurring: true, duration: 10 },
      { title: "Plier le linge", category: "Maison", recurring: true, duration: 15 },
      { title: "Préparer son cartable", category: "École", recurring: true, duration: 10 },
      { title: "Aider à préparer un repas simple", category: "Maison", recurring: true, duration: 30 },
    ],
  },
  {
    key: "10-12",
    label: "10-12 ans",
    min: 10,
    max: 12,
    tasks: [
      { title: "Préparer un repas simple seul", category: "Maison", recurring: true, duration: 30 },
      { title: "Passer l'aspirateur", category: "Maison", recurring: true, duration: 20 },
      { title: "Faire son lit", category: "Maison", recurring: true, duration: 5 },
      { title: "Gérer ses devoirs seul", category: "École", recurring: true, duration: 45 },
      { title: "S'occuper d'un animal (repas + sortie)", category: "Maison", recurring: true, duration: 15 },
    ],
  },
  {
    key: "13+",
    label: "13 ans et +",
    min: 13,
    max: 120,
    tasks: [
      { title: "Faire une lessive complète", category: "Maison", recurring: true, duration: 15 },
      { title: "Faire les courses (liste donnée)", category: "Maison", recurring: true, duration: 45 },
      { title: "Préparer un repas pour la famille", category: "Maison", recurring: true, duration: 45 },
      { title: "Gérer son emploi du temps/planning perso", category: "École", recurring: true, duration: 15 },
      { title: "Entretien de sa chambre (complet)", category: "Maison", recurring: true, duration: 30 },
    ],
  },
];

export function bracketForAge(age: number): AgeBracket | undefined {
  return AGE_BRACKETS.find((b) => age >= b.min && age <= b.max);
}
