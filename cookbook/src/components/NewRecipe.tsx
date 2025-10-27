import * as React from "react";
import {useRef, useState} from "react";

import '../css/new-recipe.css'
import RecipeIngredient from "./RecipeIngredient.tsx";
import type {Recipe} from "./interfaces/Recipe.ts";
import type {Ingredient} from "./interfaces/Ingredient.ts";
import RecipeStep from "./RecipeStep.tsx";
import type {Step} from "./interfaces/Step.ts";
import {useAuth} from "react-oidc-context";
import type {SaveRecipeResponse} from "./interfaces/SaveRecipeResponse.ts";

interface NewRecipeProps {
    recipeCallback: (recipe: string) => void
}

const NewRecipe: (recipeCallback: NewRecipeProps) => React.JSX.Element = ({recipeCallback}: NewRecipeProps) => {
    const auth = useAuth();
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    const titleRef = useRef<HTMLInputElement>(null)
    const addIngredientRef = useRef<HTMLInputElement>(null)
    const addItemRef = useRef<HTMLInputElement>(null)
    const addStepRef = useRef<HTMLInputElement>(null)
    const submitButtonRef = useRef<HTMLButtonElement>(null)

    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [items, setItems] = useState<string[]>([])
    const [steps, setSteps] = useState<Step[]>([])

    const stepsOrdered = steps?.sort((a,b)=>a.ordinal-b.ordinal)

    const addIngredient = () => {
        const ingredientValue = { name: addIngredientRef.current?.value || '', amount: '', unit: '' }
        console.log(ingredientValue)
        if (ingredientValue.name.length > 0 && ingredients.indexOf(ingredientValue) < 0) {
            setIngredients([...ingredients, ingredientValue])
            console.log("New ingredient added to ingredients list.")
        }
        else {
            console.log("Ingredient is already in ingredients list.")
        }
        console.log(ingredients)
        addIngredientRef.current!.value = ""
    }

    const updateIngredient = (oldValue: Ingredient, newValue: Ingredient) => {
        const newIngredients = [...ingredients].map(it => {
            if (it == oldValue) return newValue
            else return it
        })
        setIngredients(newIngredients)
    }

    const removeIngredient = (ingredientToRemove: Ingredient) => {
        setIngredients(ingredients.filter(ingredient=> ingredient != ingredientToRemove))
    }

    const addItem = () => {
        const itemValue = addItemRef.current?.value || ""
        const newItems = [...items, itemValue]
        if (itemValue.length > 0 && items.indexOf(itemValue) < 0) {
            setItems(newItems)
            console.log("New item added to items list.")
        }
        else {
            console.log("Item is already in items list.")
        }
        console.log(newItems)
        addItemRef.current!.value = ""
    }

    const updateItem = (oldValue: string, newValue: string) => {
        const newItems = [...items].map(item => {
            if (item == oldValue) return newValue
            else return item
        })
        setItems(newItems)
        console.log(newItems)
    }

    const removeItem = (itemToRemove: string) => {
        console.log("old items")
        console.log(items)
        console.log("new items")
        const newItems = items.filter(item => item != itemToRemove )
        console.log(newItems)
        setItems(newItems)
    }

    const addStep = () => {
        const stepValue = { ordinal: steps.length, description: addStepRef.current?.value || "" }
        console.log(stepValue)
        if (stepValue.description.length > 0 && steps.indexOf(stepValue) < 0) {
            setSteps([...steps, stepValue])
            console.log("New step added to steps list.")
        }
        else {
            console.log("Step is already in steps list.")
        }
        console.log(steps)
        addStepRef.current!.value = ""
    }

    const updateStep = (oldValue: Step, newValue: Step) => {
        const newSteps = [...steps].map(it => {
            if (it == oldValue) return newValue
            else return it
        })
        setSteps(newSteps)
    }

    const removeStep = (stepToRemove: Step) => {
        const newSteps = steps.filter(step=> step != stepToRemove)
        setSteps(newSteps)
    }

    const toRecipe = () : Recipe => {
        const recipe = {
            title: titleRef.current!.value,
            ingredients: ingredients,
            items: items,
            steps: steps
        }
        console.log(recipe)
        return recipe
    }

    const submitRecipe = (recipe: Recipe) => {
        // disable button to prevent multi-clicks
        submitButtonRef.current!.disabled = true
        const existingInnerHtml = submitButtonRef.current!.innerHTML
        submitButtonRef.current!.innerHTML = "<h2>Recipe Submitted...</h2>"

        fetch("https://api.azrinsler.com/RecipeApiLambdaUser", {
            signal: AbortSignal.timeout(120 * 1000),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth.user?.id_token ?? "",
            },
            body: JSON.stringify({
                "operation": "saveRecipe",
                "recipe": JSON.stringify(recipe)
            })
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(response);
            // reset input fields, so it's clear the submission went through
            titleRef.current!.value = ''
            setIngredients([])
            setItems([])
            setSteps([])
            submitButtonRef.current!.disabled = false
            submitButtonRef.current!.innerHTML = existingInnerHtml

            return response.json()
        })
        .then((json) => {
            console.log("SaveRecipeResponse JSON:", json)
            const saveRecipeResponse = json as SaveRecipeResponse;
            recipeCallback(saveRecipeResponse.recipeId!)
        })
        .catch((err) => {
            console.log(err)
            submitButtonRef.current!.disabled = false
            submitButtonRef.current!.innerHTML = existingInnerHtml
        });
    }

    return (
        !auth.isAuthenticated ? <></> : // returns nothing if not authenticated
        <div className='flex-column' style={{width:'100%',flexGrow:'1',overflow:'hidden'}}>
            <h1 className='hatched-background' style={{textAlign:'center', borderBottom:'1px solid light-dark(black,#a33dc2)', backgroundColor:'light-dark(#514eeb,#12000a)'}}>New Recipe</h1>

            <br/>&nbsp;<br/>

            <div id='new-recipe' className='flex-column' style={isMobile? {overflowY:'scroll'} : {flexGrow:'1'}}>
                <h3 style={{textAlign:'center'}}>Title</h3>
                <div className='flex-row' style={{placeItems:'center'}}>
                    <label htmlFor='new-recipe-title-text'></label>
                    <input ref={titleRef} type='text' id='new-recipe-title-text' name='new-recipe-title-text' className='text-input' style={{textAlign:'center'}}/>
                </div>

                <br/>&nbsp;<br/>

                <div className='flex-row' style={{flexGrow:'1',maxHeight:'100%'}}>

                    <div className='flex-column' style={{minWidth:'40%',flexGrow:'1'}}>
                        <h3>Ingredients</h3>

                        <div className='flex-row' style={{placeItems:'center'}}>
                            <input
                                ref={addIngredientRef}
                                type='text'
                                id='new-recipe-add-ingredient-text'
                                name='new-recipe-add-ingredient-text'
                                onKeyDown={ event => { if (event.key == 'Enter') { addIngredient() } } }
                                className='text-input'
                            />
                            <label htmlFor='new-recipe-add-ingredient-text'>
                                <button id='new-recipe-add-ingredient-button' className='happy-button' onClick={addIngredient}>Add Ingredient</button>
                            </label>
                        </div>
                        <div className='flex-column' style={{minHeight:'10vh',flexGrow:'1',maxHeight:'30dvh',overflowY:'scroll'}}>
                            <ul id='new-recipe-ingredient-list' style={{}}>
                                { ingredients.map((ingredient) =>
                                    <li className='flex-row' key={ingredient.name+'-'+ingredient.amount+'-'+ingredient.unit} style={{placeItems:'center',margin:'0',flexWrap:'nowrap'}}>
                                        <button className='x-button' style={ isMobile ? {} : {marginRight:'1em'}} onClick={()=>{removeIngredient(ingredient)}}>x</button>
                                        <RecipeIngredient
                                            name={ingredient.name}
                                            amount={ingredient.amount}
                                            unit={ingredient.unit}
                                            onChange={(updatedIngredient:Ingredient)=>{updateIngredient(ingredient, updatedIngredient)}}>
                                        </RecipeIngredient>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <br/>&nbsp;<br/>

                        <h3>Items</h3>
                        <div className='flex-row' style={{placeItems:'center'}}>
                            <input
                                ref={addItemRef}
                                type='text'
                                id='new-recipe-add-item-text'
                                name='new-recipe-add-item-text'
                                onKeyDown={ event => { if (event.key == 'Enter') { addItem() } } }
                                className='text-input'
                            />
                            <label htmlFor='new-recipe-add-item-text'>
                                <button id='new-recipe-add-item-button' className='happy-button' onClick={addItem}>Add Item</button>
                            </label>
                        </div>
                        <div className='flex-column' style={{minHeight:'10vh',flexGrow:'1',maxHeight:'30dvh',overflowY:'scroll'}}>
                            <ul id='new-recipe-item-list' style={{}}>
                                { items.map( (item) =>
                                    <li className='flex-row' key={item} style={{placeItems:'center',flexWrap:'nowrap',margin:'0'}}>
                                        <button className='x-button' style={ isMobile ? {} : {marginRight:'1em'}} onClick={()=>{removeItem(item)}}>x</button>
                                        <input
                                            type='text'
                                            defaultValue={item}
                                            onBlur={(event)=>{updateItem(item,event.target.value)}}
                                            onKeyDown={(event)=>{ if (event.key == 'Enter') { event.currentTarget.blur() } } }
                                            style={{backgroundColor: 'transparent', borderWidth: '0 0 1px 0', width:'100%'}}
                                        />
                                    </li>
                                )}
                            </ul>
                            <br/>&nbsp;<br/>
                        </div>
                    </div>

                    <div className='flex-column' style={{flexGrow:'2'}}>
                        <h3>Steps</h3>
                        <div className='flex-row' style={{placeItems:'center'}}>
                            <input
                                ref={addStepRef}
                                type='text'
                                id='new-recipe-add-step-text'
                                name='new-recipe-add-step-text'
                                onKeyDown={ event => { if (event.key == 'Enter') { addStep() } } }
                                className='text-input'
                            />
                            <label htmlFor='new-recipe-add-step-text'>
                                <button id='new-recipe-add-step-button' className='happy-button' onClick={addStep}>Add Step</button>
                            </label>
                        </div>
                        <div className='flex-column' style={{minHeight:'10vh',flexGrow:'1',maxHeight:'70dvh',overflowY:'scroll'}}>
                            <ul id='new-recipe-step-list' style={{flexGrow:'1'}}>
                                { stepsOrdered.map((step, index) =>
                                    <li className='flex-row' key={step.ordinal} style={{placeItems:'center',margin:'0',flexWrap:'nowrap'}}>
                                        <button className='x-button' style={ isMobile ? {} : {marginRight:'1em'}} onClick={()=>{removeStep(step)}}>x</button>
                                        <RecipeStep
                                            ordinal={index}
                                            description={ step.description }
                                            onChange={(updatedStep:Step)=>{updateStep(step, updatedStep)}}>
                                        </RecipeStep>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <button id='new-recipe-submit-button' ref={submitButtonRef} className='happy-button'><h2 className='text-outline' style={{textAlign:'center'}} onClick={()=>{submitRecipe(toRecipe())}}>Submit Recipe</h2></button>
        </div>
    )
}
export default NewRecipe