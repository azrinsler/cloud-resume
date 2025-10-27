export interface GetRecipeResponse {
    recipes: RecipeResponse[]
}

interface RecipeResponse {
    recipeId: string
    title: string
}