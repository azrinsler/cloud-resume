export interface GetRecipeResponse {
    recipes: RecipeResponse[]
}

interface RecipeResponse {
    id: string
    title: string
}