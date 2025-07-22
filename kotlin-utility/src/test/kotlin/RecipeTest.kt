import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File
import kotlin.text.Charsets.UTF_8

class RecipeTest {
    @Test
    fun `Recipe loaded from JSON should map seamlessly to Recipe Data class` () {
        val inputFile = File("src/test/resources/test-recipe.json")
        val inputString = inputFile.readText(UTF_8)
        val recipe = JacksonWrapper.readJson(inputString) as Recipe
        val recipeJson = JacksonWrapper.readTree(inputString)

        // object title matches
        assertTrue(recipe.title == recipeJson["title"].asText())

        // all object ingredients match
        assertTrue(
            recipe.ingredients.all {
                val jsonIngredient = recipeJson["ingredients"][recipe.ingredients.indexOf(it)]
                val nameMatches = it.name ==  jsonIngredient["name"].asText()
                val unitMatches = it.unit == jsonIngredient["unit"].asText()
                val amountMatches = it.amount == jsonIngredient["amount"]?.asText()
                nameMatches && unitMatches && amountMatches
            }
        )

        // all object items match
        assertTrue(
            recipe.items.all {
                it == recipeJson["items"][recipe.items.indexOf(it)].asText()
            }
        )

        // all object steps (including notes) match
        assertTrue(
            recipe.steps.all {
                val jsonStep = recipeJson["steps"][recipe.steps.indexOf(it)]
                val ordinalMatches = it.ordinal == jsonStep["ordinal"].asInt()
                val descriptionMatches = it.description == jsonStep["description"].asText()
                val notesMatch = it.notes?.all { note -> note == jsonStep["notes"][it.notes.indexOf(note)].asText() } ?: true
                ordinalMatches && descriptionMatches && notesMatch
            }
        )
    }
}