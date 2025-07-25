import type {Ingredient} from "./Ingredient.ts";
import type {RecipeStep} from "./RecipeStep.ts";

export interface Recipe {
    title: string;
    ingredients: Ingredient[];
    items: string[];
    steps: RecipeStep[]
}