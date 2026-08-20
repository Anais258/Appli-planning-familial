import type { Category } from "../api/types";

export interface AgeTaskSuggestion {
  title: string;
  category: Category;
  recurring: boolean;
  duration: number;
  // Floor for a transversal (all-ages) suggestion — e.g. religious/spiritual
  // activities only make sense to suggest from a certain age.
  minAge?: number;
}

export interface AgeBracket {
  key: string;
  label: string;
  min: number;
  max: number;
  tasks: AgeTaskSuggestion[];
}

// Consolidated from common parenting/eldercare guidance — a starting point
// to tweak per family, not a rulebook.
export const AGE_BRACKETS: AgeBracket[] = [
  {
    key: "0-5",
    label: "Moins de 6 ans",
    min: 0,
    max: 5,
    // Trop jeune pour porter ses propres tâches — ce sont celles des
    // parents (soins, routine) qui s'affichent pour ce membre.
    tasks: [
      { title: "Routine du coucher (histoire, câlin)", category: "Santé", recurring: true, duration: 15 },
      { title: "Préparer les repas/biberons", category: "Maison", recurring: true, duration: 20 },
      { title: "Rendez-vous pédiatre / vaccins", category: "Santé", recurring: false, duration: 30 },
      { title: "Activité d'éveil (lecture, jeux sensoriels)", category: "Loisirs", recurring: true, duration: 20 },
      { title: "Sieste à heure fixe", category: "Santé", recurring: true, duration: 90 },
      { title: "Préparer le sac de crèche/nounou", category: "Maison", recurring: true, duration: 10 },
    ],
  },
  {
    key: "6-9",
    label: "6-9 ans",
    min: 6,
    max: 9,
    tasks: [
      { title: "Préparer le cartable", category: "École", recurring: true, duration: 10 },
      { title: "Faire les devoirs", category: "École", recurring: true, duration: 30 },
      { title: "Lecture du soir", category: "École", recurring: true, duration: 15 },
      { title: "Brossage de dents matin/soir", category: "Santé", recurring: true, duration: 5 },
      { title: "Douche/bain", category: "Santé", recurring: true, duration: 15 },
      { title: "Ranger sa chambre", category: "Maison", recurring: true, duration: 15 },
      { title: "Activité extrascolaire (sport, musique, hobbies)", category: "Loisirs", recurring: true, duration: 60 },
      { title: "Coucher à heure fixe", category: "Santé", recurring: true, duration: 5 },
      { title: "Temps d'écran limité", category: "Santé", recurring: true, duration: 30 },
    ],
  },
  {
    key: "10-12",
    label: "10-12 ans",
    min: 10,
    max: 12,
    tasks: [
      { title: "Faire les devoirs", category: "École", recurring: true, duration: 45 },
      { title: "Lecture du soir", category: "École", recurring: true, duration: 15 },
      { title: "Brossage de dents matin/soir", category: "Santé", recurring: true, duration: 5 },
      { title: "Douche/bain", category: "Santé", recurring: true, duration: 15 },
      { title: "Ranger sa chambre", category: "Maison", recurring: true, duration: 15 },
      { title: "Activité extrascolaire (sport, musique, hobbies)", category: "Loisirs", recurring: true, duration: 60 },
      { title: "Coucher à heure fixe", category: "Santé", recurring: true, duration: 5 },
      { title: "Temps d'écran limité", category: "Santé", recurring: true, duration: 30 },
      { title: "Révisions", category: "École", recurring: true, duration: 30 },
      { title: "Club sportif / sortie entre amis", category: "Loisirs", recurring: true, duration: 90 },
      { title: "Aide ménagère (vaisselle, poubelles)", category: "Maison", recurring: true, duration: 15 },
    ],
  },
  {
    key: "13-17",
    label: "13-17 ans",
    min: 13,
    max: 17,
    tasks: [
      { title: "Devoirs / révisions", category: "École", recurring: true, duration: 45 },
      { title: "Cours particuliers", category: "École", recurring: true, duration: 60 },
      { title: "Club sportif / sortie entre amis", category: "Loisirs", recurring: true, duration: 90 },
      { title: "Aide ménagère (vaisselle, poubelles)", category: "Maison", recurring: true, duration: 15 },
      { title: "Rendez-vous médicaux (orthodontiste...)", category: "Santé", recurring: false, duration: 45 },
      { title: "Leçons de conduite", category: "Loisirs", recurring: true, duration: 60 },
      { title: "Petit boulot / job d'été", category: "Travail", recurring: false, duration: 240 },
    ],
  },
  {
    key: "65+",
    label: "65 ans et +",
    min: 65,
    max: 120,
    tasks: [
      { title: "Prise de médicaments (rappel)", category: "Santé", recurring: true, duration: 5 },
      { title: "Rendez-vous médical (généraliste, spécialiste, kiné)", category: "Santé", recurring: false, duration: 45 },
      { title: "Courses (souvent avec aide)", category: "Maison", recurring: true, duration: 45 },
      { title: "Promenade / activité physique douce", category: "Santé", recurring: true, duration: 30 },
      { title: "Visite famille / petits-enfants", category: "Loisirs", recurring: true, duration: 90 },
      { title: "Activité sociale (club, association)", category: "Loisirs", recurring: true, duration: 90 },
      { title: "Aide à domicile", category: "Maison", recurring: true, duration: 60 },
      { title: "Démarches administratives (retraite, mutuelle)", category: "Maison", recurring: false, duration: 30 },
    ],
  },
];

// Suggestions valables à tout âge, en plus de la tranche du membre — c'est
// aussi ce qui couvre les adultes 18-64 ans, qui n'ont pas de tranche dédiée.
export const TRANSVERSAL_TASKS: AgeTaskSuggestion[] = [
  { title: "Préparer les repas principaux", category: "Maison", recurring: true, duration: 30 },
  { title: "Hygiène quotidienne", category: "Santé", recurring: true, duration: 10 },
  { title: "Routine sommeil (coucher/lever)", category: "Santé", recurring: true, duration: 10 },
  { title: "Anniversaires / événements familiaux", category: "Loisirs", recurring: false, duration: 60 },
  { title: "Activité religieuse ou spirituelle", category: "Loisirs", recurring: true, duration: 60, minAge: 12 },
];

export function bracketForAge(age: number): AgeBracket | undefined {
  return AGE_BRACKETS.find((b) => age >= b.min && age <= b.max);
}

export function transversalTasksForAge(age: number): AgeTaskSuggestion[] {
  return TRANSVERSAL_TASKS.filter((t) => t.minAge === undefined || age >= t.minAge);
}
