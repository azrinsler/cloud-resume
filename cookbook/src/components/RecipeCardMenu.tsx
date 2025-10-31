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

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const deleteRecipe = () => {
        const recipeId = localStorage.getItem("recipeId")
        if (recipeId != null) {
            setIsDeleting(true)
            deleteOptionCallback(recipeId)
            // wait a few seconds then start checking if the recipe is deleted yet
            setTimeout( async () => {
                let deletionStatus = false
                while (!deletionStatus) {
                    deletionStatus = await checkIfRecipeDeleted()
                    setIsDeleted(deletionStatus)
                }
            }, 2000);
        }
    }

    useEffect(() => {
        if (isDeleted) {
            sidebarOptionCallback("browse")
        }
    }, [isDeleted, sidebarOptionCallback]);

    useEffect(() => {
        if (isDeleting && !isDeleted) {
            recipeCardRef!.current!.style.animationPlayState = "running"
        }
        else {
            recipeCardRef!.current!.style.animationPlayState = "paused"
        }
    }, [isDeleting, isDeleted, recipeCardRef]);

    const checkIfRecipeDeleted = async (): Promise<boolean> => {
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
        .then((response) => {
            console.log(response)
            if (!response.ok) {
                throw new Error('Failed to retrieve deleted recipe');
            }
            // if we get something back, the recipe hasn't been deleted yet
            console.log("Deleted recipe returned - it hasn't been deleted yet")
            return false
        })
        .catch((err) => {
            console.log(err)
            // if we failed to get anything, its probably gone
            setIsDeleted(true)
            return true
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