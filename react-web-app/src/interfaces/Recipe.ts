
export interface Recipe {
    title: string;
    ingredients: Ingredient[];
    items: string[];
    steps: RecipeStep[]
}

interface Ingredient {
    name: string;
    unit: string;
    amount?: number;
}

interface RecipeStep {
    ordinal: number;
    description: string;
    notes?: string[];
}
