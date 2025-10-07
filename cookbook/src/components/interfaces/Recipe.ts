import type {Ingredient} from "./Ingredient.ts";
import type {Step} from "./Step.ts";

export interface Recipe {
    title?: string;
    user?: string;
    ingredients?: Ingredient[];
    items?: string[];
    steps?: Step[]
}