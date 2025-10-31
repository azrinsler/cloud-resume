import * as React from "react";
import type {Recipe} from "./interfaces/Recipe.ts";

import '../css/recipe-card.css'
import {useAuth} from "react-oidc-context";
import RecipeCardMenu from "./RecipeCardMenu.tsx";
import {useRef} from "react";

interface RecipeCardProps {
    recipe: Recipe
    sidebarOptionCallback: (sidebarOption: string) => void
    fetchRecipeCallback: (recipeId: string) => void
}

const RecipeCard: (recipeCardProps: RecipeCardProps) => React.JSX.Element = ({recipe, sidebarOptionCallback}: RecipeCardProps) => {
    const auth = useAuth();
    const recipeCardRef = useRef<HTMLDivElement>(null)
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const stepsOrdered = recipe.steps?.sort((a,b)=>a.ordinal-b.ordinal)
    const isRecipeOwner = () => {
        return auth.isAuthenticated && auth.user?.profile.sub == recipe.user
    }

    const deleteRecipe = () => {
        console.log("Deleting Recipe w/ ID: " + recipe.recipeId)
        fetch("https://api.azrinsler.com/RecipeApiLambdaUser", {
            signal: AbortSignal.timeout(120 * 1000),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth.user?.id_token ?? "",
            },
            body: JSON.stringify({
                "operation": "deleteRecipe",
                "recipeId": recipe.recipeId
            })
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(response);
        })
        .catch((err) => {
            console.log(err)
        });
    }
    return (
        <div className='flex-column' style={{width:'100%',flexGrow:'1'}}>
            <h1 style={{textAlign:'center', borderBottom:'1px solid light-dark(black,#a33dc2)', backgroundColor:'light-dark(#514eeb,#12000a)'}}>Recipe</h1>
            <div className='flex-column' style={{width:'100%',placeContent:'center',placeItems:'center',flexGrow:'1'}}>
                <div ref={recipeCardRef} id="recipe-card" style={isMobile ? {border:"none"}:{}}>
                    <div className="flex-row" style={{width:'100%'}}>
                        <div id="simple-title" className="flex-row" style={isMobile ? {display:'none'} : {}}>
                            <h2 style={{marginTop:'-0.15em'}}>Simple Recipes</h2>
                        </div>
                        <div id="recipe-title" className="flex-row" style={isMobile ? {borderRadius:'0.35em 0.35em 0 0',borderLeft:'none'} : {}}>
                            <h2 style={{flexGrow:1,textAlign:'center',marginTop:'-0.15em'}}>{recipe.title}</h2>
                            { // only show delete recipe button if the user is logged in
                                isRecipeOwner()
                                    ?
                                    <>
                                        <RecipeCardMenu
                                            sidebarOptionCallback={sidebarOptionCallback}
                                            deleteOptionCallback={deleteRecipe}
                                            recipeCardRef={recipeCardRef}
                                        ></RecipeCardMenu>
                                    </>
                                    :
                                    <></>
                            }
                        </div>
                    </div>
                    <div className="flex-row" style={{flexGrow:1,minHeight:'25lh',maxHeight:'80dvh',overflowY:'scroll'}}>
                        <div className="flex-column"
                             style={ isMobile
                                 ? {minWidth:'200px',width:'25%',flexGrow:2,padding:'1em'}
                                 : {minWidth:'200px',width:'25%',borderRight:'1px dotted light-dark(#201b21,#6fdde1)',flexGrow:2,padding:'1em'}
                            }>
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