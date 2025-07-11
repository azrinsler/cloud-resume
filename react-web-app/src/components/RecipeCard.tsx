interface Recipe {
    title: string;
    ingredients: Ingredient[];
    items: string[];
    steps: RecipeStep[]
}

interface Ingredient {
    name: string;
    unit: string;
    amount?: number;
}

interface RecipeStep {
    ordinal: number;
    description: string;
    notes?: string[];
}

export function RecipeCard ({title, ingredients, items, steps} : Recipe) {
    const stepsOrdered = steps.sort((a,b)=>a.ordinal-b.ordinal)
    return (
        <>
            <div id="recipe-card">
                <div className="flex-row" style={{width:'100%'}}>
                    <div id="recipe-title" className="flex-row">
                        <h2>{title}</h2>
                    </div>
                    <div id="simple-title" className="flex-row no-mobile">
                        <h2>Simple Recipes</h2>
                    </div>
                </div>
                <div className="flex-row" style={{flexGrow:1,minHeight:'25lh'}}>
                    <div className="flex-column" style={{minWidth:'200px',width:'25%',border:'1px solid',flexGrow:2,padding:'1em'}}>
                        <div>
                            <h3>Ingredients</h3>
                            <hr/>
                            <ul id="ingredients-list">
                                { ingredients.map(ingredient=>
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
                            <ul id="items-list">
                                { items.map(item=>
                                    <li key={item}>{item}</li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="flex-column" style={{minWidth:'200px',width:'70%',border:'1px solid',flexGrow:1,padding:'1em'}}>
                        <h3>Steps</h3>
                        <hr/>
                        <ul id="recipe-steps">
                            { stepsOrdered.map(step=>
                                <li key={step.ordinal}>
                                    {step.description}
                                    <ul>
                                        { step.notes?.map(note=> <li key={note}>{note}</li>) }
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}