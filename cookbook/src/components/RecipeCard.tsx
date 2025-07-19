import * as React from "react";
import type {Recipe} from "../interfaces/Recipe.ts";

const RecipeCard: React.FC<Recipe> = (recipe: Recipe) => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const stepsOrdered = recipe.steps.sort((a,b)=>a.ordinal-b.ordinal)
    return (
        <div className='flex-column' style={{width:'100%',placeContent:'center',placeItems:'center',padding:'1em',flexGrow:'1'}}>
            <div id="recipe-card">
                <div className="flex-row" style={{width:'100%'}}>
                    <div id="simple-title" className="flex-row no-mobile">
                        <h2>Simple Recipes</h2>
                    </div>
                    <div id="recipe-title" className="flex-row" style={isMobile ? {borderRadius:'0.35em 0.35em 0 0'} : {}}>
                        <h2>{recipe.title}</h2>
                    </div>
                </div>
                <div className="flex-row" style={{flexGrow:1,minHeight:'25lh'}}>
                    <div className="flex-column" style={{minWidth:'200px',width:'25%',borderRight:'1px solid',flexGrow:2,padding:'1em'}}>
                        <div>
                            <h3>Ingredients</h3>
                            <hr/>
                            <ul id="ingredients-list">
                                { recipe.ingredients.map(ingredient=>
                                    <li key={ingredient.name}>
                                        <div className="flex-row">
                                            <span>{ingredient.name}</span>
                                            <div style={{flexGrow:1}}></div>
                                            <span>{ingredient.amount} {ingredient.unit}</span>
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
                                { recipe.items.map(item=>
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
                            { stepsOrdered.map(step=>
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
    )
}
export default RecipeCard