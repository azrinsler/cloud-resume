package azrinsler.aws

import JacksonWrapper
import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent
import io.opentelemetry.api.trace.Span
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException
import software.amazon.awssdk.services.dynamodb.model.QueryRequest
import software.amazon.awssdk.services.dynamodb.model.ScanRequest

@Suppress("unused") // Supported events: https://github.com/aws/aws-lambda-java-libs/blob/main/aws-lambda-java-events/README.md
class RecipeLambda : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    val logger : Logger = LoggerFactory.getLogger(RecipeLambda::class.java)
    val region : Region = Region.US_EAST_1


    override fun handleRequest(event: APIGatewayProxyRequestEvent, context: Context): APIGatewayProxyResponseEvent {
        // OpenTelemetry span context information - helps AWS correlate logs to traces
        val span = Span.current()
        if (span.spanContext.isValid) {
            MDC.put("traceId", span.spanContext.traceId)
            MDC.put("spanId", span.spanContext.spanId)
        }

        logger.trace("Recipe Lambda Handler - API Gateway Proxy Request Event received.")

        val response = APIGatewayProxyResponseEvent()

        // set response headers for later
        with (response) {
            withHeaders(
                mapOf(
                    "Content-Type" to "application/json",
                    "Access-Control-Allow-Origin" to "*"
                )
            )
        }

        try {

            logger.info("Request Body: ${event.body}")
            val inputAsJson = JacksonWrapper.readTree(event.body)

            val operation =
                if (inputAsJson["operation"].isTextual) inputAsJson["operation"].asText().also { logger.trace("Operation is Textual") }
                else inputAsJson["operation"].toString()

            logger.info("Operation: $operation")

            when (operation) {
                "searchById" -> {
                    val recipeKey = "recipeId"
                    val recipeId =
                        if (inputAsJson[recipeKey].isTextual)   inputAsJson[recipeKey].asText().also { logger.trace("Recipe ID is Textual") }
                        else                                    inputAsJson[recipeKey].toString()

                    val responseBody = searchById(recipeId)
                    if (responseBody.isNotEmpty()) { // return an 'ok' response with whatever our search turned up
                        logger.info("Recipe found")
                        with (response) {
                            statusCode = 200
                            body = responseBody
                        }
                    }
                    else { // return 'resource not found'
                        logger.warn("Recipe was not found")
                        with (response) {
                            statusCode = 404
                            body = "No recipe with id $recipeId found"
                        }
                    }
                }
                "getRecipes" -> {
                    val responseBody = getRecipeTitles()
                    if (responseBody.isNotEmpty()) { // return an 'ok' response with whatever our search turned up
                        logger.info("Recipes Found: ${responseBody.count { it == '{'} }")
                        with (response) {
                            statusCode = 200
                            body = responseBody
                        }
                    }
                    else { // return 'resource not found'
                        logger.warn("Failed to get recipes")
                        with (response) {
                            statusCode = 404
                            body = "No recipes found..? That can't be right."
                        }
                    }
                }
                else -> { // Return a 'bad request' response (if an unknown operation is requested)
                    logger.warn("Unrecognized operation: $operation")
                    with (response) {
                        statusCode = 400
                        body = "Unrecognized operation: $operation"
                    }
                }
            }
            return response
        }
        catch (e: Exception) {
            logger.error("Failure! ${e.message}")
            throw e
        }
    }

    fun searchById (recipeId : String) : String {
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
                throw RuntimeException("Failed to query recipe from DynamoDb", e)
            }
        }

        // re-assembles the recipe JSON out of the DynamoDB document fields
        var responseBody = ""
        if (queryResponse.items().isNotEmpty()) {
            val foundRecipe = queryResponse.items()[0] as Map<String, AttributeValue>

            val title = foundRecipe["title"]?.s()

            val ingredients = foundRecipe["ingredients"]?.l()?.map {
                val ingredient = it.m()
                """{ "name": "${ingredient["name"]?.s()}", "unit": "${ingredient["unit"]?.s()}", "amount": "${ingredient["amount"]?.s()}" }"""
            }

            val items = foundRecipe["items"]?.l()?.map { "\"${it.s()}\"" }

            val steps = foundRecipe["steps"]?.l()?.map {
                val step = it.m()
                """{ "ordinal": "${step["ordinal"]?.n()}", "description": "${step["description"]?.s()}", "notes": ${ if (step["notes"]?.l()?.isNotEmpty() == true) step["notes"]?.l()?.map { note -> "\"${note.s()}\"" } else "[]"} }"""
            }
            responseBody = """{ "title": "$title", "ingredients": $ingredients, "items": $items, "steps": $steps }"""
        }
        return responseBody
    }

    fun getRecipeTitles() : String {
        val dynamoDbClient = DynamoDbClient.builder()
            .region(region)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build()

        val queryRequest = ScanRequest.builder()
            .tableName("Recipes")
            .projectionExpression("recipe_id, title")
            .build()

        val queryResponse = dynamoDbClient.scan(queryRequest)

        // assembles an array of the results returned as little JSON objects:  [{ id, title },{ id, title },etc.]
        var response = ""
        for (item in queryResponse.items()) {
            val id = item["recipe_id"]!!.s()
            val title = item["title"]!!.s()
            val json = """{ "id": "$id", "title": "$title" }"""
            response = if (response.isNotEmpty()) "$response, $json" else json
        }
        return """{ "recipes": [$response] }"""
    }
}