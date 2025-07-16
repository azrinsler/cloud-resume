package azrinsler.aws

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException
import software.amazon.awssdk.services.dynamodb.model.QueryRequest
import java.util.UUID


@Suppress("unused") // Supported events: https://github.com/aws/aws-lambda-java-libs/blob/main/aws-lambda-java-events/README.md
class GetRecipeLambda : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    override fun handleRequest(event: APIGatewayProxyRequestEvent, context: Context): APIGatewayProxyResponseEvent {
        val log = context.logger.also { it.log("Get Recipe Lambda Handler - API Gateway Proxy Request Event received.") }

        val response = APIGatewayProxyResponseEvent()

        try {
            val region = Region.US_EAST_1

            log.log("Request Body: ${event.body}")
            val inputAsJson = JacksonWrapper.readTree(event.body)

            val recipeKey = "recipeId"
            var recipeId =
                if (inputAsJson[recipeKey].isTextual)   inputAsJson[recipeKey].asText()
                else                                    inputAsJson[recipeKey].toString()

            if (recipeId.isEmpty())
                recipeId = UUID.randomUUID().toString()

            val dynamoDbClient = DynamoDbClient.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build()

            val queryRequest = QueryRequest.builder()
                .tableName("Recipes")
                .keyConditionExpression("recipe_id = :recipe_id")
                .expressionAttributeValues( mapOf(":recipe_id" to AttributeValue.builder().s(recipeId).build()) )
                .build()

            val queryResponse = dynamoDbClient.use {
                try {
                    dynamoDbClient.query(queryRequest)
                }
                catch (e: DynamoDbException) {
                    log.log("Exception occurred sending message: ${e.message}")
                    throw e
                }
            }

            // re-assembles the recipe JSON out of the DynamoDB document fields
            var responseBody =  "No recipe with id $recipeId found"
            if (queryResponse.items().isNotEmpty()) {
                log.log("Recipe Found")
                val foundRecipe = queryResponse.items()[0] as Map<String, AttributeValue>

                val title = foundRecipe["title"]?.s()
                log.log("Title: $title")

                val ingredients = foundRecipe["ingredients"]?.l()?.map {
                    val ingredient = it.m()
                    """{ "name": "${ingredient["name"]?.s()}", "unit": "${ingredient["unit"]?.s()}", "amount": "${ingredient["amount"]?.n()}" }"""
                }
                log.log("Ingredients: $ingredients")

                val items = foundRecipe["items"]?.l()?.map { "\"${it.s()}\"" }
                log.log("Items: $items")

                val steps = foundRecipe["steps"]?.l()?.map {
                    val step = it.m()
                    """{ "ordinal": "${step["ordinal"]?.n()}", "description": "${step["description"]?.s()}", "notes": ${ if (step["notes"]?.l()?.isNotEmpty() == true) step["notes"]?.l()?.map { note -> "\"${note.s()}\"" } else "[]"} }"""
                }
                log.log("Steps: $steps")

                responseBody = """{ "title": "$title", "ingredients": $ingredients, "items": $items, "steps": $steps }"""
            }

            // respond to the original request after sending the message to queue
            with (response) {
                // uncertain how necessary these headers are...
                withHeaders(
                    mapOf(
                        "Content-Type" to "application/json",
                        "Access-Control-Allow-Origin" to "*"
                    )
                )
                statusCode = 200
                body = responseBody
            }
            return response
        }
        catch (e: Exception) {
            log.log("Failure! ${e.message}")
            throw e
        }
    }
}