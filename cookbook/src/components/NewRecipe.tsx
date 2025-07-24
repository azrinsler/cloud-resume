import * as React from "react";
import {useRef, useState} from "react";

import '../css/new-recipe.css'

const NewRecipe: () => React.JSX.Element = () => {

    const addIngredientRef = useRef<HTMLInputElement>(null)
    const addItemRef = useRef<HTMLInputElement>(null)
    const addStepRef = useRef<HTMLInputElement>(null)

    const [ingredients, setIngredients] = useState<string[]>([])
    const [items, setItems] = useState<string[]>([])
    const [steps, setSteps] = useState<string[]>([])

    const addIngredient = () => {
        const ingredientValue = addIngredientRef.current?.value || ""
        console.log(ingredientValue)
        if (ingredientValue.length > 0 && ingredients.indexOf(ingredientValue) < 0) {
            setIngredients([...ingredients, ingredientValue])
            console.log("New ingredient added to ingredients list.")
        }
        else {
            console.log("Ingredient is already in ingredients list.")
        }
        console.log(ingredients)
        addIngredientRef.current!.value = ""
    }

    const removeIngredient = (ingredientToRemove: string) => {
        setIngredients(ingredients.filter(ingredient=> ingredient != ingredientToRemove))
    }

    const addItem = () => {
        const itemValue = addItemRef.current?.value || ""
        console.log(itemValue)
        if (itemValue.length > 0 && items.indexOf(itemValue) < 0) {
            setItems([...items, itemValue])
            console.log("New item added to items list.")
        }
        else {
            console.log("Item is already in items list.")
        }
        console.log(items)
        addItemRef.current!.value = ""
    }

    const removeItem = (itemToRemove: string) => {
        setItems(items.filter(item => item != itemToRemove ))
    }

    const addStep = () => {
        const stepValue = addStepRef.current?.value || ""
        console.log(stepValue)
        if (stepValue.length > 0 && steps.indexOf(stepValue) < 0) {
            setSteps([...steps, stepValue])
            console.log("New step added to steps list.")
        }
        else {
            console.log("Step is already in steps list.")
        }
        console.log(steps)
        addStepRef.current!.value = ""
    }

    const removeStep = (stepToRemove: string) => {
        setSteps(steps.filter(step=> step != stepToRemove))
    }

    return (
        <div className='flex-column' style={{width:'100%',flexGrow:'1'}}>
            <h1 className='hatched-background' style={{textAlign:'center', borderBottom:'1px solid'}}>New Recipe</h1>

            <br/>&nbsp;<br/>

            <div id='new-recipe' className='flex-column' style={{flexGrow:'1'}}>
                <h3 style={{textAlign:'center'}}>Title</h3>
                <div className='flex-row' style={{placeItems:'center'}}>
                    <label htmlFor='new-recipe-title-text'></label>
                    <input type='text' id='new-recipe-title-text' name='new-recipe-title-text' />
                </div>

                <br/>&nbsp;<br/>

                <div className='flex-row' style={{flexGrow:'1'}}>

                    <div className='flex-column' style={{minWidth:'40%',flexGrow:'1'}}>
                        <h3>Ingredients</h3>

                        <div className='flex-column' style={{minHeight:'25%'}}>
                            <div className='flex-row' style={{placeItems:'center'}}>
                                <input
                                    ref={addIngredientRef}
                                    type='text'
                                    id='new-recipe-add-ingredient-text'
                                    name='new-recipe-add-ingredient-text'
                                    onKeyDown={ event => { if (event.key == 'Enter') { addIngredient() } } }
                                />
                                <label htmlFor='new-recipe-add-ingredient-text'>
                                    <button id='new-recipe-add-ingredient-button' onClick={addIngredient}>Add Ingredient</button>
                                </label>
                            </div>

                            <ul id='new-recipe-ingredient-list'>
                                { ingredients.map(ingredient =>
                                    <li className='flex-row' key={ingredient} style={{placeItems:'center'}}>
                                        <button className='x-button' style={{marginRight:'1em'}} onClick={()=>{removeIngredient(ingredient)}}>x</button>
                                        {ingredient}
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
                            />
                            <label htmlFor='new-recipe-add-item-text'>
                                <button id='new-recipe-add-item-button' onClick={addItem}>Add Item</button>
                                <span style={{flexGrow:'1'}}></span>
                            </label>
                        </div>

                        <ul id='new-recipe-item-list'>
                            { items.map( item =>
                                <li className='flex-row' key={item} style={{placeItems:'center'}}>
                                    <button className='x-button' style={{marginRight:'1em'}} onClick={()=>{removeItem(item)}}>x</button>
                                    {item}
                                </li>
                            )}
                        </ul>
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
                            />
                            <label htmlFor='new-recipe-add-step-text'>
                                <button id='new-recipe-add-step-button' onClick={addStep}>Add Step</button>
                            </label>
                        </div>
                        <ul id='new-recipe-step-list'>
                            { steps.map(step =>
                                <li className='flex-row' key={step} style={{placeItems:'center'}}>
                                    <button className='x-button' style={{marginRight:'1em'}} onClick={()=>{removeStep(step)}}>x</button>
                                    {step}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default NewRecipe