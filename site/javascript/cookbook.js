import testRecipe from '../json/test-recipe.json' with { type : 'json' }

function loadRecipe (recipe) {
    setRecipeTitle(recipe.title)
    setIngredients(recipe.ingredients)
    setItems(recipe.items)
    setSteps(recipe.steps)
}

loadRecipe(testRecipe) // so we can test that the loadRecipe function works as expected

function setSimpleTitle (title) {
    let simpleTitle = document.getElementById("simple-title")
    simpleTitle.getElementsByTagName("h2")[0].textContent = title
}

function setRecipeTitle (title) {
    let recipeTitle = document.getElementById("recipe-title")
    recipeTitle.getElementsByTagName("h2")[0].textContent = title
}

function setIngredients (ingredients) {
    let ingredientsList = document.getElementById("ingredients-list");
    ingredientsList.innerHTML = "";

    for (let i = 0; i < ingredients.length; i++) {
        let nextItem = document.createElement("li");
        let nextDiv = document.createElement("div");
        let nextIngredient = document.createElement("span");
        let nextSpacer = document.createElement("div");
        let nextMeasurement = document.createElement("span");

        nextDiv.classList.add("flex-row");
        nextIngredient.innerText = ingredients[i].name;
        nextSpacer.setAttribute("style","flex-grow:1;");
        nextMeasurement.innerText =
            ingredients[i].amount === undefined
                ? ingredients[i].unit
                : ingredients[i].amount + " " + ingredients[i].unit;

        nextDiv.append(nextIngredient, nextSpacer, nextMeasurement);
        nextItem.append(nextDiv);

        ingredientsList.append(nextItem);
    }
}

function setItems (items) {
    let itemsList = document.getElementById("items-list")
    itemsList.innerHTML = ""
    for (let i = 0; i < items.length; i++) {
        let nextItem = document.createElement("li");
        nextItem.textContent = items[i]
        itemsList.append(nextItem)
    }
}

function setSteps (steps) {
    let recipeSteps = document.getElementById("recipe-steps")
    recipeSteps.innerHTML = ""
    for (let i = 0; i < steps.length; i++) {
        let nextItem = document.createElement("li");
        let nextNotes = document.createElement("ul");
        let nextStep = steps.find((it) => { return it.ordinal === i });
        nextItem.textContent = nextStep.description;
        if (nextStep.notes !== undefined && nextStep.notes.length > 0) {
            for (let ii = 0; ii < nextStep.notes.length; ii++) {
                let nextNote = document.createElement("li")
                nextNote.innerText = nextStep.notes[ii]
                nextNotes.append(nextNote);
            }
            nextItem.append(nextNotes)
        }
        recipeSteps.append(nextItem);
    }
}