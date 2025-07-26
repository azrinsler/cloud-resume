import * as React from "react";
import {useRef, useState} from "react";

import '../css/ingredient.css'
import type {Step} from "../interfaces/Step.ts";

interface RecipeStepProps {
    ordinal: number,
    description?: string | undefined,
    notes?: string[]
    onChange: (step: Step) => void
}

export const RecipeStep: (step: RecipeStepProps) => React.JSX.Element = (step: RecipeStepProps) => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    const descriptionRef = useRef<HTMLInputElement>(null)
    const noteRef = useRef<HTMLInputElement>(null)

    const [notes, setNotes] = useState<string[]>(step.notes || [])

    const addNote = () => {
        const noteValue = noteRef.current?.value || ""
        const newNotes = [...notes, noteValue]
        if (noteValue.length > 0 && notes.indexOf(noteValue) < 0) {
            setNotes(newNotes)
            console.log("New note added to notes list.")
        }
        else {
            console.log("Note is already in notes list.")
        }
        console.log(newNotes)
        noteRef.current!.value = ""
    }

    const updateNote = (oldValue: string, newValue: string) => {
        const newNotes = [...notes].map(item => {
            if (item == oldValue) return newValue
            else return item
        })
        setNotes(newNotes)
        console.log(newNotes)
    }

    const removeNote = (noteToRemove: string) => {
        const newItems = notes.filter(note => note != noteToRemove )
        console.log(newItems)
        setNotes(newItems)
    }

    function toStep() : Step {
        return {
            ordinal: step.ordinal,
            description: descriptionRef.current?.value || '',
            notes: notes
        }
    }

    return (
        <div className='flex-row' style={{placeItems: 'center', width: '100%', flexWrap:'wrap', marginTop:'0.25em'}}>
            <input
                ref={descriptionRef}
                type='text'
                placeholder='What to do next?'
                defaultValue={step.description}
                onBlur={()=>{step.onChange(toStep())}}
                onKeyDown={(event)=>{ if (event.key == 'Enter') { event.currentTarget.blur() } } }
                style={{backgroundColor: 'transparent', borderWidth: '0 0 1px 0', width:'100%'}}
            />

            <div className='flex-column' style={{flexGrow:'1',maxHeight:'30vh',overflowY:'scroll'}}>
                <ul>
                    { notes.map( (note) =>
                        <li className='flex-row' key={note} style={{placeItems:'center',flexWrap:'nowrap',margin:'0'}}>
                            <button className='x-button' style={isMobile ? {} : {marginRight:'1em'}} onClick={()=>{removeNote(note)}}>x</button>
                            <input
                                type='text'
                                defaultValue={note}
                                onBlur={(event)=>{updateNote(note,event.target.value)}}
                                onKeyDown={(event)=>{ if (event.key == 'Enter') { event.currentTarget.blur() } } }
                                style={{backgroundColor: 'transparent', borderWidth: '0 0 1px 0', width:'100%'}}
                            />
                        </li>
                    )}
                    <li className='flex-row' key='add-note-input-li' style={{placeItems:'center',flexWrap:'nowrap',margin:'0'}}>
                        <label htmlFor={'step-'+step.ordinal}>
                            <button className='plus-button' onClick={addNote} style={ isMobile ? { borderRadius:'0.25em'} : { borderRadius:'0.5em', marginRight:'1em'} }>+</button>
                        </label>
                        <input
                            ref={noteRef}
                            id={'step-'+step.ordinal}
                            name={'step-'+step.ordinal}
                            type='text'
                            placeholder='Any notes?'
                            onBlur={()=>{step.onChange(toStep())}}
                            onKeyDown={ event => { if (event.key == 'Enter') { addNote() } } }
                            style={{backgroundColor: 'transparent', borderWidth: '0 0 1px 0', width:'100%'}}
                        />
                    </li>
                </ul>
            </div>
        </div>

    )
}
export default RecipeStep