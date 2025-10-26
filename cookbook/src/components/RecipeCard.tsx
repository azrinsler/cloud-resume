import * as React from "react";
import type {Recipe} from "./interfaces/Recipe.ts";

import '../css/recipe-card.css'
import {useRef} from "react";
import {useAuth} from "react-oidc-context";

const RecipeCard: React.FC<Recipe> = (recipe: Recipe) => {
    const auth = useAuth();

    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const stepsOrdered = recipe.steps?.sort((a,b)=>a.ordinal-b.ordinal)
    const isRecipeOwner = () => {
        return auth.isAuthenticated && auth.user?.profile.sub == recipe.user
    }

    const deleteRecipeRef = useRef<HTMLButtonElement>(null)
    const deleteRecipeLabelRef = useRef<HTMLButtonElement>(null)
    const deleteRecipe = () => {
        // disable button to prevent multi-clicks
        deleteRecipeRef.current!.disabled = true
        deleteRecipeLabelRef.current!.innerText = "Deleting..."
        console.log("Recipe ID: " + recipe.id)
        fetch("https://api.azrinsler.com/RecipeApiLambdaUser", {
            signal: AbortSignal.timeout(120 * 1000),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth.user?.id_token ?? "",
            },
            body: JSON.stringify({
                "operation": "deleteRecipe",
                "recipeId": recipe.id
            })
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(response);
            deleteRecipeRef.current!.disabled = false
            deleteRecipeLabelRef.current!.innerText = "Deleted!"
            localStorage.setItem("sidebarOption", "browse")

            // Set a timer to reload after 5 seconds (5000 ms)
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        })
        .catch((err) => {
            console.log(err)
            deleteRecipeRef.current!.disabled = false
            deleteRecipeLabelRef.current!.innerText = "Delete FAILED."
        });
    }
    return (
        <div className='flex-column' style={{width:'100%',flexGrow:'1'}}>
            <h1 className='hatched-background' style={{textAlign:'center', borderBottom:'1px solid light-dark(black,#a33dc2)', backgroundColor:'light-dark(#514eeb,#12000a)'}}>Recipe</h1>
            <div className='flex-column' style={{width:'100%',placeContent:'center',placeItems:'center',flexGrow:'1'}}>
                <div id="recipe-card">
                    <div className="flex-row" style={{width:'100%'}}>
                        <div id="simple-title" className="flex-row" style={isMobile ? {display:'none'} : {}}>
                            <h2 style={{marginTop:'-0.25em'}}>Simple Recipes</h2>
                        </div>
                        <div id="recipe-title" className="flex-row" style={isMobile ? {borderRadius:'0.35em 0.35em 0 0'} : {}}>
                            <h2 style={{flexGrow:1,textAlign:'center',marginTop:'-0.25em'}}>{recipe.title}</h2>
                            { // only show delete recipe button if the user is logged in
                                isRecipeOwner()
                                    ? <div id="delete-recipe-button" className="flex-row">
                                        <span ref={deleteRecipeLabelRef} style={{marginLeft:'auto'}}>Delete Recipe &rarr;</span>
                                        <button ref={deleteRecipeRef} className='x-button' style={{margin:'0 0 0 0.25em'}} onClick={()=>{deleteRecipe()}}>x</button>
                                    </div>
                                    : <></>
                            }
                        </div>
                    </div>
                    <div className="flex-row" style={{flexGrow:1,minHeight:'25lh',maxHeight:'80dvh',overflowY:'scroll'}}>
                        <div className="flex-column" style={{minWidth:'200px',width:'25%',borderRight:'1px dotted light-dark(gray,#6fdde1)',flexGrow:2,padding:'1em'}}>
                            <div>
                                <h3>Ingredients</h3>
                                <hr/>
                                <ul id="ingredients-list">
                                    { recipe.ingredients?.map(ingredient=>
                                        <li key={ingredient.name}>
                                            <div className="flex-row">
                                                <span>{ingredient.name}</span>
                                                <div style={{flexGrow:1,margin:'0.5em',borderBottom:'1px dashed light-dark(grey,#484619)'}}></div>
                                                <span style={{textWrap:'nowrap'}}>{ingredient.amount||''} {ingredient.unit||''}</span>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <br/>&nbsp;<br/>
                            <div>
                                <h3>Items</h3>
                                <hr/>
                                <ul id="recipe-items-list">
                                    { recipe.items?.map(item=>
                                        <li key={item}>
                                            <input id={item} type='checkbox' />
                                            <label htmlFor={item}>{item}</label>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="flex-column" style={{minWidth:'200px',width:'70%',flexGrow:1,padding:'1em'}}>
                            <h3>Steps</h3>
                            <hr/>
                            <ul id="recipe-steps">
                                { stepsOrdered?.map(step=>
                                    <li key={step.ordinal}>
                                        <input type='radio' name='selected-step' id={'step'+step.ordinal} value={step.description}/>
                                        <label htmlFor={'step'+step.ordinal}>{step.description}</label>
                                        <ul style={{cursor:'default'}}>
                                            {step.notes?.map(note => <li key={note}>{note}</li>)}
                                        </ul>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default RecipeCard