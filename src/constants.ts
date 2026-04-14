




import { Task, BudgetCategory } from "./types";
export { API_URL } from "./config/api";

// IMPORTANT: Portul trebuie sa fie 3005 (noul port al backend-ului)
export const MIN_ELEMENT_SIZE = 60;
export const FIXED_CANVAS_WIDTH = 3000;
export const FIXED_CANVAS_HEIGHT = 2000;
export const MARGIN_PX = 20;

// --- CONFIGURARE LIMITE PLAN GRATUIT ---
// Modifica aici numerele pentru a schimba restrictiile
export const PLAN_LIMITS = {
    free: {
        maxGuests: 1,          // Maxim invitati in lista
        maxElements: 5,        // Maxim mese/scaune pe plan
        maxCustomTasks: 3,     // Maxim sarcini proprii
        maxBudgetItems: 6,     // Maxim randuri per categorie buget
        maxCalculatorBudget: 500 // Limit for budget calculator in free plan
    },
    basic: {
        maxGuests: 9999,
        maxElements: 0,
        maxCustomTasks: 0,
        maxBudgetItems: 0,
        maxCalculatorBudget: 0
    },
    premium: {
        maxGuests: 9999,
        maxElements: 9999,
        maxCustomTasks: 9999,
        maxBudgetItems: 9999,
        maxCalculatorBudget: 999999999
    }
};

export const translations = {
  ro: {
    candyBar: 'Candy Bar',
    mainBar: 'Bar Principal',
    photoCorner: 'Photo Corner',
    lounge: 'Zona Lounge'
  }
};

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_BUDGET_CATEGORIES: BudgetCategory[] = [
  { 
    id: 'cat-1', name: 'Locatie & Mancare', percentage: 45, items: [
      { id: 'itm-1', name: 'Inchiriere Sala', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-2', name: 'Meniu Mancare', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-3', name: 'Bauturi (Open Bar)', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-4', name: 'Tort & Candy Bar', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-2', name: 'Foto & Video', percentage: 12, items: [
      { id: 'itm-5', name: 'Fotograf Principal', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-6', name: 'Videograf', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-7', name: 'Cabina Foto / 360', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-3', name: 'Muzica & Atmosfera', percentage: 10, items: [
      { id: 'itm-8', name: 'Formatie / Band', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-9', name: 'DJ & Sonorizare', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-10', name: 'Lumini & Scena', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-4', name: 'Tinute & Styling', percentage: 8, items: [
      { id: 'itm-11', name: 'Rochie de Mireasa', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-12', name: 'Costum Mire', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-13', name: 'Make-up & Hairstyle', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-5', name: 'Flori & Decor', percentage: 10, items: [
      { id: 'itm-14', name: 'Buchet Mireasa & Nasa', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-15', name: 'Aranjamente Mese', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-16', name: 'Decor Prezidiu', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  },
  {
    id: 'cat-6', name: 'Diverse', percentage: 15, items: [
      { id: 'itm-17', name: 'Invitatii & Papetarie', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-18', name: 'Transport & Cazare', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-19', name: 'Marturii', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
      { id: 'itm-20', name: 'Verighete', estimatedCost: 0, finalCost: 0, paidAmount: 0 },
    ]
  }
];
