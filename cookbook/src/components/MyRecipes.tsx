import * as React from "react";
import {useEffect, useState} from "react";
import type {MyRecipesResponse} from "./interfaces/MyRecipesResponse.ts";

import testJson from '../json/test/test-get-recipe-response.json' with { type : 'json' }
const testResponse = testJson as MyRecipesResponse

import '../css/my-recipes.css'
import Preheating from "./Preheating.tsx";
import {useAuth} from "react-oidc-context";
import type {Recipe} from "./interfaces/Recipe.ts";

interface MyRecipesProps {
    recipeCallback: (recipe: Recipe) => void
}

const MyRecipes: (recipeCallback: MyRecipesProps) => React.JSX.Element = ({recipeCallback}: MyRecipesProps) => {
    const auth = useAuth();
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState<MyRecipesResponse>();
    const [searchTerm, setSearchTerm] = useState("")

    const filteredTitles = (data || testResponse)?.recipes.filter(recipe => searchMatches(recipe.title!))

    function searchMatches (term: string) : boolean {
        const pattern = new RegExp('.*(' + searchTerm + ').*', 'i')
        return pattern.test(term)
    }

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading && auth.user) {
            console.log("searchByUser()")
            fetch("https://api.azrinsler.com/RecipeApiLambdaPublic", {
                signal: AbortSignal.timeout(120 * 1000),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "operation": "searchByUser",
                    "user": auth.user.profile.sub
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
                const getRecipeResponse = json as MyRecipesResponse;
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
                    : <div id="my-recipes" className="flex-column">
                        <h1 className='hatched-background' style={{textAlign:'center', borderBottom:'1px solid light-dark(black,#a33dc2)', backgroundColor:'light-dark(#514eeb,#12000a)'}}>My Recipes</h1>
                        <div className='flex-row' style={{placeContent:'center',placeItems:'center',padding:'1em',borderBottom:'1px solid'}}>
                            <label htmlFor='my-recipes-search' style={{fontSize:'1.25em'}}>Title:&nbsp;</label>
                            <input
                                id='my-recipes-search'
                                type='text' name='my-recipes-search'
                                style={{width:'80%',textAlign:'center'}}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder='Filter by Title'
                                className='text-input'
                            />
                        </div>
                        { error ? <><p style={{color:'red'}}>{error}</p><p style={{color:'darkgoldenrod'}}>Example Result:</p></> : <></> }
                        <ul style={{marginLeft:'1em'}}> {
                            filteredTitles.map(recipe =>
                                <li key={recipe.id}  onClick={() => {setLoading(true); recipeCallback(recipe)}}><h3 style={isMobile ? {textAlign:'center'} : {textAlign:'left'}}>{recipe.title}</h3></li>
                            )
                        } </ul>
                    </div>
            }
        </>
    )
}
export default MyRecipes