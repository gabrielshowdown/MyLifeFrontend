export type FoodCategory = 'LATICINIOS' | 'CARNES' | 'HORTIFRUTI' | 'CONGELADOS' | 'DESPENSA' | 'BEBIDAS' | 'TEMPEROS' | 'OUTROS';
export type FoodLocation = 'GELADEIRA' | 'FREEZER' | 'DESPENSA' | 'ARMARIO';
export type FoodUnit = 'UN' | 'KG' | 'G' | 'L' | 'ML' | 'PACOTE';
export type FoodStatus = 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'OK' | 'NO_DATE';
/* Características filtráveis: o filtro exige que o item tenha TODAS as selecionadas */
export type FoodTrait = 'GLUTEN_FREE' | 'LACTOSE_FREE' | 'HOMEMADE';

export interface FoodItem {
  id: number;
  name: string;
  category: FoodCategory;
  location: FoodLocation;
  quantity: number;
  unit: FoodUnit;
  expirationDate?: string | null; /* yyyy-MM-dd. Só pode faltar em itens caseiros (sem prazo definido) */
  purchaseDate?: string | null; /* yyyy-MM-dd. Compra, ou preparo/congelamento quando caseiro */
  opened: boolean;
  openedDate?: string | null; /* yyyy-MM-dd */
  notes?: string;
  emoji?: string; /* Opcional. Se vazio, usa o emoji da categoria */
  glutenFree: boolean;
  lactoseFree: boolean;
  homemade: boolean; /* Feito em casa (tortas, salgados congelados...) */
}

/* Rótulos e ícones usados nos selects, na tabela e nos filtros */
export const FOOD_CATEGORIES: { value: FoodCategory; label: string; icon: string; emoji: string }[] = [
  { value: 'LATICINIOS', label: 'Laticínios', icon: 'egg_alt', emoji: '🥛' },
  { value: 'CARNES', label: 'Carnes', icon: 'kebab_dining', emoji: '🥩' },
  { value: 'HORTIFRUTI', label: 'Hortifruti', icon: 'eco', emoji: '🥬' },
  { value: 'CONGELADOS', label: 'Congelados', icon: 'ac_unit', emoji: '🧊' },
  { value: 'DESPENSA', label: 'Despensa', icon: 'inventory_2', emoji: '🥫' },
  { value: 'BEBIDAS', label: 'Bebidas', icon: 'local_drink', emoji: '🥤' },
  { value: 'TEMPEROS', label: 'Temperos', icon: 'spa', emoji: '🧂' },
  { value: 'OUTROS', label: 'Outros', icon: 'category', emoji: '🍽️' }
];

export const FOOD_TRAITS: { value: FoodTrait; label: string; emoji: string }[] = [
  { value: 'GLUTEN_FREE', label: 'Sem glúten', emoji: '🌾' },
  { value: 'LACTOSE_FREE', label: 'Sem lactose', emoji: '🥛' },
  { value: 'HOMEMADE', label: 'Caseiro', emoji: '🏠' }
];

export const FOOD_LOCATIONS: { value: FoodLocation; label: string; icon: string }[] = [
  { value: 'GELADEIRA', label: 'Geladeira', icon: 'kitchen' },
  { value: 'FREEZER', label: 'Freezer', icon: 'severe_cold' },
  { value: 'DESPENSA', label: 'Despensa', icon: 'shelves' },
  { value: 'ARMARIO', label: 'Armário', icon: 'door_sliding' }
];

export const FOOD_UNITS: { value: FoodUnit; label: string }[] = [
  { value: 'UN', label: 'un' },
  { value: 'KG', label: 'kg' },
  { value: 'G', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'ML', label: 'mL' },
  { value: 'PACOTE', label: 'pacote' }
];

export const FOOD_STATUS_LABELS: Record<FoodStatus, string> = {
  EXPIRED: 'Vencido',
  CRITICAL: 'Crítico',
  WARNING: 'Atenção',
  OK: 'Ok',
  NO_DATE: 'Sem prazo'
};

/* Converte 'yyyy-MM-dd' em Date local (new Date('yyyy-MM-dd') interpretaria como UTC e voltaria um dia) */
export function parseIsoDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* Dias até o vencimento: negativo = já venceu, 0 = vence hoje */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = parseIsoDate(iso)!;
  return Math.round((expiration.getTime() - today.getTime()) / 86400000);
}

/* Dias desde uma data passada (ex.: há quantos dias o item foi congelado) */
export function daysSince(iso: string): number {
  return -daysUntil(iso);
}

/* O status é calculado e não persistido, para nunca ficar desatualizado */
export function getFoodStatus(iso: string | null | undefined, alertDays: number): FoodStatus {
  if (!iso) return 'NO_DATE';
  const days = daysUntil(iso);
  if (days < 0) return 'EXPIRED';
  if (days <= 1) return 'CRITICAL';
  if (days <= alertDays) return 'WARNING';
  return 'OK';
}
