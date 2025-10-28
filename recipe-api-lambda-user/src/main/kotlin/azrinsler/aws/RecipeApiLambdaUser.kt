package azrinsler.aws

import JacksonWrapper
import Recipe
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
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.SendMessageRequest


const val accountId = "477850672676"
// const val newRecipeQueueName = "new-recipe-input-queue"
const val saveRecipeQueueName = "save-recipe-input-queue"
const val deleteRecipeQueueName = "delete-recipe-input-queue"

@Suppress("unused") // Supported events: https://github.com/aws/aws-lambda-java-libs/blob/main/aws-lambda-java-events/README.md
class RecipeApiLambdaUser : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    val logger : Logger = LoggerFactory.getLogger(RecipeApiLambdaUser::class.java)
    val region : Region = Region.US_EAST_1

    val saveRecipeQueueUrl = "https://sqs.$region.amazonaws.com/$accountId/$saveRecipeQueueName"
    val deleteRecipeQueueUrl = "https://sqs.$region.amazonaws.com/$accountId/$deleteRecipeQueueName"

    override fun handleRequest(event: APIGatewayProxyRequestEvent, context: Context): APIGatewayProxyResponseEvent {
        // OpenTelemetry span context information - helps AWS correlate logs to traces
        val span = Span.current()
        if (span.spanContext.isValid) {
            MDC.put("traceId", span.spanContext.traceId)
            MDC.put("spanId", span.spanContext.spanId)
        }

        logger.trace("Recipe API Lambda Handler - User API - API Gateway Proxy Request Event received.")

        logger.info("Auth claims stuffs")
        val claims = JacksonWrapper.readJson(event.requestContext?.authorizer as Map<*,*>) as Map<String,Any>
        for (key in claims.keys)
            logger.info(key)
        val userAuth = claims["claims"]
        logger.info("claims: $userAuth")
        val userAuthMap = userAuth as Map<*,*>
        val userAuthJson = JacksonWrapper.readJson(userAuthMap) as Map<String,Any>
        val userSub = userAuthJson["sub"] as String

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
                "saveRecipe" -> {
                    val sqsClient = SqsClient.builder()
                        .region(region)
                        .credentialsProvider(DefaultCredentialsProvider.create())
                        .build()

                    val recipeBody = inputAsJson["recipe"].asText()

                    logger.info("Recipe Body: $recipeBody")

                    // make sure we can read this input as a Recipe before accepting it and set user to their claims sub
                    val recipe = (JacksonWrapper.readJson(recipeBody) as? Recipe)?.copy(user = userSub)
                    if (recipe != null) {
                        logger.info("Recipe with user: ${JacksonWrapper.writeJson(recipe)}")
                        sqsClient.use {
                            val sendMsgRequest = SendMessageRequest.builder()
                                .queueUrl(saveRecipeQueueUrl)
                                .messageBody(JacksonWrapper.writeJson(recipe))
                                .build()

                            val sqsResponse = sqsClient.sendMessage(sendMsgRequest)

                            with (response) {
                                statusCode = 202
                                body = """
                                    { 
                                        "recipeId": "${recipe.recipeId}",
                                        "message": "saveRecipe request sent to queue. Assuming no issues, it will start appearing in search results momentarily.",
                                        "messageId": "${sqsResponse.messageId()}"
                                    }                                       
                                """.trimIndent()
                            }
                        }
                    }
                    else with (response) {
                        statusCode = 422
                        body = "Failed to parse input recipe as Recipe data class."
                    }
                }
                "deleteRecipe" -> {
                    val sqsClient = SqsClient.builder()
                        .region(region)
                        .credentialsProvider(DefaultCredentialsProvider.create())
                        .build()

                    val recipeId = inputAsJson["recipeId"].asText()
                    if (recipeId != null) {
                        val message = """{ "recipeId": "$recipeId", "user": "$userSub" }"""
                        sqsClient.use {
                            val sendMsgRequest = SendMessageRequest.builder()
                                .queueUrl(deleteRecipeQueueUrl)
                                .messageBody(message)
                                .build()

                            val sqsResponse = sqsClient.sendMessage(sendMsgRequest)

                            with (response) {
                                statusCode = 200
                                body = """
                                    { 
                                        "message":"deleteRecipe request sent to queue. Assuming no issues, it will be deleted momentarily.",
                                        "messageId": "${sqsResponse.messageId()}"
                                    }                                       
                                """.trimIndent()

                            }
                        }
                    }
                    else with (response) {
                        statusCode = 422
                        body = "Failed to parse input."
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
}