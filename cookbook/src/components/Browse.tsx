import * as React from "react";
import {useEffect, useState} from "react";
import type {GetRecipeResponse} from "../interfaces/GetRecipeResponse.ts";

import testJson from '../json/test-get-recipe-response.json' with { type : 'json' }
const testResponse = testJson as GetRecipeResponse

import '../css/browse.css'
import Preheating from "./Preheating.tsx";

interface BrowseProps {
    recipeCallback: (recipe: string) => void
}

const Browse: (recipeCallback: BrowseProps) => React.JSX.Element = ({recipeCallback}: BrowseProps) => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState<GetRecipeResponse>();

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading) {
            console.log("getRecipes()")
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
                loading
                    ? <Preheating></Preheating>
                    : <div id="browse-recipes" className="flex-column">
                            <h1 className='hatched-background' style={{textAlign:'center', borderBottom:'1px solid'}}>Recipes</h1>
                            { error ? <><p style={{color:'red'}}>{error}</p><p style={{color:'darkgoldenrod'}}>Example Result:</p></> : <></> }
                            <ul style={{marginLeft:'1em'}}> {
                                (data || testResponse).recipes.map(recipe =>
                                    <li key={recipe.id}  onClick={() => {recipeCallback(recipe.id)}}><h3 style={isMobile ? {textAlign:'center'} : {textAlign:'left'}}>{recipe.title}</h3></li>
                                )
                            } </ul>
                        </div>
            }
        </>
    )
}
export default Browse