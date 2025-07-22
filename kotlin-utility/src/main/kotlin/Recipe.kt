import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.UUID

val logger : Logger = LoggerFactory.getLogger(Recipe::class.java)

data class Recipe (
    val recipeId: UUID = UUID.randomUUID().also { logger.info("Called to instantiate a Recipe w/ no id. A new id has been randomly generated: $it") },
    val title: String,
    val ingredients: List<Ingredient>,
    val items: List<String>,
    val steps: List<Step>
)

data class Ingredient (
    val name: String,
    val unit: String,
    val amount: String?
)

data class Step (
    val ordinal: Int,
    val description: String,
    val notes: List<String>?
)