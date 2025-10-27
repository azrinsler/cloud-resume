import * as React from "react";
import {useEffect, useState} from "react";
import type {GetRecipeResponse} from "./interfaces/GetRecipeResponse.ts";

import testJson from '../json/test/test-get-recipe-response.json' with { type : 'json' }
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
    const [searchTerm, setSearchTerm] = useState("")

    const filteredTitles = (data || testResponse)?.recipes.filter(recipe => searchMatches(recipe.title))

    function searchMatches (term: string) : boolean {
        const pattern = new RegExp('.*(' + searchTerm + ').*', 'i')
        return pattern.test(term)
    }

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading) {
            console.log("getRecipes()")
            fetch("https://api.azrinsler.com/RecipeApiLambdaPublic", {
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
                console.log("Response JSON:")
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
                        <h1 style={{textAlign:'center', borderBottom:'1px solid light-dark(black,#a33dc2)', backgroundColor:'light-dark(#514eeb,#12000a)'}}>Browse</h1>
                        <div className='flex-row' style={{placeContent:'center',placeItems:'center',padding:'1em',borderBottom:'1px solid'}}>
                            <label htmlFor='browse-recipes-search' style={{fontSize:'1.25em'}}>Title:&nbsp;</label>
                            <input
                                id='browse-recipes-search'
                                type='text' name='browse-recipes-search'
                                style={{width:'80%',textAlign:'center'}}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder='Filter by Title'
                                className='text-input'
                            />
                        </div>
                        { error ? <><p style={{color:'red'}}>{error}</p><p style={{color:'darkgoldenrod'}}>Example Result:</p></> : <></> }
                        <ul style={{marginLeft:'1em'}}> {
                            filteredTitles.map(recipe =>
                                <li key={recipe.recipeId}  onClick={() => {setLoading(true); recipeCallback(recipe.recipeId)}}><h3 style={isMobile ? {textAlign:'center'} : {textAlign:'left'}}>{recipe.title}</h3></li>
                            )
                        } </ul>
                    </div>
            }
        </>
    )
}
export default Browse