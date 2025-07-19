import * as React from "react";
import {useEffect, useState} from "react";
import type {GetRecipeResponse} from "../interfaces/GetRecipeResponse.ts";

interface BrowseProps {
    recipeCallback: (recipe: string) => void
}

const Browse: (recipeCallback: BrowseProps) => React.JSX.Element = ({recipeCallback}: BrowseProps) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState<GetRecipeResponse>();

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading) {
            fetch("https://api.azrinsler.com/RecipeLambda", {
                signal: AbortSignal.timeout(120 * 1000),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "operation": "getRecipes"
                })
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((json) => {
                    console.log(json);
                    const getRecipeResponse = json as GetRecipeResponse;
                    setData(getRecipeResponse);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [loading]);

    return (
        <>
            {
                error
                    ? <span>{error}</span>
                    : loading
                        ? <span>Loading</span>
                        : data != undefined
                            ? <div>
                                <h2>Recipes</h2>
                                <ul> {
                                    data.recipes.map(recipe =>
                                        <li key={recipe.id} onClick={() => {recipeCallback(recipe.id)}}>{recipe.title}</li>
                                    )
                                } </ul>
                            </div>
                            : <>No Recipes Found</>
            }
        </>
    )
}
export default Browse