export interface SaveRecipeResponse {
    statusCode: number,
    body: {
        "recipeId":  string | undefined,
        "message":  string | undefined,
        "messageId": string | undefined
    }
}