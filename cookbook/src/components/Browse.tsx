import * as React from "react";
import {useEffect, useState} from "react";
import type {GetRecipeResponse} from "../interfaces/GetRecipeResponse.ts";

const Browse : () => React.JSX.Element = () => {

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
                    "Access-Control-Allow-Origin": "https://api.azrinsler.com/RecipeLambda"
                },
                body: JSON.stringify({ "operation":"getRecipes" })
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((jsonData) => {
                console.log(jsonData);
                const getRecipeResponse = jsonData as GetRecipeResponse;
                setData(getRecipeResponse);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
        }
    }, [data, loading] );

    return (
        <>
            {
                error
                    ? <span>{error}</span>
                : loading
                    ? <span>Loading</span>
                : data?.recipes?.map(recipe=> <p>{recipe.title}</p>)
            }
        </>
    )
}
export default Browse