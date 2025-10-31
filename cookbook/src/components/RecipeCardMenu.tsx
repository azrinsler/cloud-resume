import * as React from "react";
import {type RefObject, useEffect, useState} from "react";

import '../css/recipe-card-menu.css'

interface RecipeCardMenuProps {
    sidebarOptionCallback: (sidebarOption: string) => void
    deleteOptionCallback: (recipeId: string) => void
    recipeCardRef: RefObject<HTMLDivElement | null>
}


const RecipeCardMenu: (sidebarOptionCallback: RecipeCardMenuProps) => React.JSX.Element = ({sidebarOptionCallback, deleteOptionCallback, recipeCardRef}: RecipeCardMenuProps) => {

    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const [deleteFailed, setDeleteFailed] = useState(false)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const deleteRecipe = () => {
        const recipeId = localStorage.getItem("recipeId")
        if (recipeId != null) {
            setIsDeleting(true)
            deleteOptionCallback(recipeId)
        }
    }

    useEffect(() => {
        if (isDeleting) {
            // stop trying if delete still hasn't succeeded after 30 seconds
            setTimeout( () => {
                if (isDeleting) {
                    console.log("Delete still hasn't finished after 30 seconds - assuming something went wrong")
                    setIsDeleting(false)
                    setDeleteFailed(true)
                }
            }, 30000)

            setTimeout( async () => {
                const deletionStatus = await checkIfRecipeDeleted()
                setIsDeleted(deletionStatus)
            },2000)

        }
    }, [isDeleting]);

    useEffect(() => {
        if (isDeleted) {
            setIsDeleting(false)
            // sidebarOptionCallback("browse")
        }
    }, [isDeleted, sidebarOptionCallback]);

    useEffect(() => {
        if (isDeleting && !isDeleted && !deleteFailed) {
            recipeCardRef!.current!.style.animationPlayState = "running"
        }
        else {
            recipeCardRef!.current!.style.animationPlayState = "paused"
        }
    }, [isDeleting, isDeleted, recipeCardRef, deleteFailed]);

    const checkIfRecipeDeleted = async (): Promise<boolean> => {
        console.log("checking if recipe deleted")
        return await fetch("https://api.azrinsler.com/RecipeApiLambdaPublic", {
            signal: AbortSignal.timeout(120 * 1000),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "operation": "searchById",
                "recipeId": localStorage.getItem("recipeId")
            })
        })
        .then( async (response) => {
            console.log(response)
            if (response.ok) {
                // if we get something back, the recipe hasn't been deleted yet
                console.log("Deleted recipe returned - it hasn't been deleted yet")
                return false
            }
            else if (response.status == 404)
            {
                console.log("Got a 404 for deleted recipe - assuming deletion is complete")
                const text = await response.text()
                //const json = await response.json()
                console.log( text )
                //console.log( json.body )
                setIsDeleted(true)
                return true
            }
            else {
                console.log(response)
                throw new Error('Failed to retrieve deleted recipe for unexpected reason');
            }

        })
        .catch((err) => {
            console.log(err)
            console.log("setting deleteFailed to true")
            setDeleteFailed(true)
            return false
        });
    }

    return (
        <div className={'flex-column'} style={{width:'0'}}>
            <span id='recipe-card-menu-button' onClick={toggleMenu}>...</span>
            {
                isOpen
                    ? <div id='recipe-card-menu' className={'flex-column'} onMouseLeave={() => setIsOpen(false)}>
                        <span className='recipe-card-menu-option' onClick={ () => { sidebarOptionCallback('edit') } }>Edit</span>
                        {
                            isDeleted ? <span className='recipe-card-menu-option'>Deleted!</span>
                                : isDeleting ? <span className='recipe-card-menu-option'>Deleting...</span>
                                    : <span className='recipe-card-menu-option' onClick={deleteRecipe}>Delete</span>
                        }
                      </div>
                    : <></>
            }
        </div>
    )
}
export default RecipeCardMenu