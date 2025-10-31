import * as React from "react";
import type {Ingredient} from "./interfaces/Ingredient.ts";
import {useRef} from "react";

import '../css/ingredient.css'

interface RecipeIngredientProps {
    name: string,
    amount?: string | undefined,
    unit?: string | undefined
    onChange: (ingredient: Ingredient) => void
}

export const RecipeIngredient: (ingredient: RecipeIngredientProps) => React.JSX.Element = (ingredient: RecipeIngredientProps) => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    const nameRef = useRef<HTMLInputElement>(null)
    const amountRef = useRef<HTMLInputElement>(null)
    const unitRef = useRef<HTMLInputElement>(null)

    function toIngredient() : Ingredient {
        return {
            name: nameRef.current?.value || '',
            amount: amountRef.current?.value,
            unit: unitRef.current?.value || ''
        }
    }

    return (
        <div className='flex-row ingredient' style={{placeItems: 'center', width: '100%', flexWrap: 'nowrap'}}>
            <input
                ref={nameRef}
                type='text'
                placeholder="What's it called?"
                defaultValue={ingredient.name}
                style={{width: '60%', backgroundColor: 'transparent', borderWidth: '0 0 1px 0'}}
                onBlur={()=>{ingredient.onChange(toIngredient())}}
                onKeyDown={(event)=>{ if (event.key == 'Enter') { event.currentTarget.blur() } } }
            />
            <input
                ref={amountRef}
                type='text'
                placeholder={isMobile ? 'amount' : 'How much?'}
                defaultValue={ingredient.amount}
                style={isMobile
                    ? {
                        width: '20%',
                        marginLeft: '0.25em',
                        textAlign: 'center',
                        backgroundColor: 'transparent',
                        borderWidth: '0 0 1px 0'
                    }
                    : {
                        width: '6em',
                        marginLeft: '0.25em',
                        paddingRight: '1em',
                        textAlign: 'end',
                        backgroundColor: 'transparent',
                        borderWidth: '0 0 1px 0'
                    }}
                onBlur={()=>{ingredient.onChange(toIngredient())}}
                onKeyDown={(event)=>{ if (event.key == 'Enter') { event.currentTarget.blur() } } }
            />
            <input
                ref={unitRef}
                type='text'
                placeholder={isMobile ? 'unit' : 'Measured in?'}
                defaultValue={ingredient.unit}
                style={isMobile
                    ? {
                        width: '20%',
                        marginLeft: '0.25em',
                        textAlign: 'center',
                        backgroundColor: 'transparent',
                        borderWidth: '0 0 1px 0'
                    }
                    : {
                        width: '7em',
                        marginLeft: '0.25em',
                        paddingLeft: '1em',
                        backgroundColor: 'transparent',
                        borderWidth: '0 0 1px 0'
                    }}
                onBlur={()=>{ingredient.onChange(toIngredient())}}
                onKeyDown={(event)=>{ if (event.key == 'Enter') { event.currentTarget.blur() } } }
            />
        </div>
    )
}
export default RecipeIngredient