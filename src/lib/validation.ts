import { z } from "zod";

// Team name validation
export const teamNameSchema = z
  .string()
  .trim()
  .min(1, "Le nom d'équipe est requis")
  .max(50, "Le nom d'équipe ne peut pas dépasser 50 caractères")
  .regex(/^[a-zA-Z0-9\s\-_àâäéèêëïîôöùûüÿæœçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÆŒÇ]+$/, "Le nom d'équipe ne peut contenir que des lettres, chiffres, espaces et tirets");

// Round title validation
export const roundTitleSchema = z
  .string()
  .trim()
  .min(1, "Le titre de la manche est requis")
  .max(100, "Le titre ne peut pas dépasser 100 caractères");

// Question validation
export const questionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(5, "La question doit contenir au moins 5 caractères")
    .max(500, "La question ne peut pas dépasser 500 caractères"),
  type: z.enum(["buzzer", "qcm", "text"], {
    errorMap: () => ({ message: "Type de question invalide" }),
  }),
  correct_answer: z
    .string()
    .trim()
    .min(1, "La réponse correcte est requise")
    .max(200, "La réponse ne peut pas dépasser 200 caractères"),
  points: z
    .number()
    .int("Les points doivent être un nombre entier")
    .min(0, "Les points ne peuvent pas être négatifs")
    .max(1000, "Les points ne peuvent pas dépasser 1000"),
  duration: z
    .number()
    .int("La durée doit être un nombre entier")
    .min(5, "La durée minimum est de 5 secondes")
    .max(300, "La durée maximum est de 300 secondes"),
  choices: z.array(z.string().trim().min(1).max(200)).optional(),
  audio_file: z.string().optional(),
});

// Answer validation
export const answerSchema = z
  .string()
  .trim()
  .min(1, "La réponse est requise")
  .max(500, "La réponse ne peut pas dépasser 500 caractères");

// Settings validation
export const settingsSchema = z.object({
  project_name: z
    .string()
    .trim()
    .min(1, "Le nom du projet est requis")
    .max(100, "Le nom du projet ne peut pas dépasser 100 caractères")
    .optional(),
  max_teams: z
    .number()
    .int("Le nombre maximum d'équipes doit être un nombre entier")
    .min(1, "Au moins 1 équipe est requise")
    .max(100, "Le nombre maximum d'équipes ne peut pas dépasser 100")
    .optional(),
  websocket_port: z
    .number()
    .int("Le port doit être un nombre entier")
    .min(1024, "Le port doit être supérieur à 1023")
    .max(65535, "Le port doit être inférieur à 65536")
    .optional(),
});

// Auth validation
export const emailSchema = z
  .string()
  .trim()
  .email("Adresse email invalide");

export const passwordSchema = z
  .string()
  .min(6, "Le mot de passe doit contenir au moins 6 caractères")
  .max(100, "Le mot de passe ne peut pas dépasser 100 caractères");
