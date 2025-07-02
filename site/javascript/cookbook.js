import testRecipe from '../json/test-recipe.json' with { type : 'json' }

let simpleTitle = document.getElementById("simple-title")

let recipeTitle = document.getElementById("recipe-title")
let recipeSteps = document.getElementById("recipe-steps")

let itemsList = document.getElementById("items-list")
let ingredientsList = document.getElementById("ingredients-list")

function loadRecipe () {
    console.log(testRecipe)
}
loadRecipe()