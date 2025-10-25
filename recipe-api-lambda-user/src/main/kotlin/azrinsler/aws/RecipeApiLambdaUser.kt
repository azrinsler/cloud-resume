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
const val newRecipeQueueName = "new-recipe-input-queue"
const val deleteRecipeQueueName = "delete-recipe-input-queue"

@Suppress("unused") // Supported events: https://github.com/aws/aws-lambda-java-libs/blob/main/aws-lambda-java-events/README.md
class RecipeApiLambdaUser : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    val logger : Logger = LoggerFactory.getLogger(RecipeApiLambdaUser::class.java)
    val region : Region = Region.US_EAST_1

    val newRecipeQueueUrl = "https://sqs.$region.amazonaws.com/$accountId/$newRecipeQueueName"
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
        val userAuth = claims[claims.keys.first()]
        logger.info(userAuth.toString())
        val userAuthMap = userAuth as Map<*,*>
        logger.info("Successfully parsed user auth as Map<*,*>")
        val userAuthJson = JacksonWrapper.readJson(userAuthMap) as Map<String,Any>
        val userSub = userAuthJson["sub"] as String
        logger.info("user sub: $userSub")

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
                "newRecipe" -> {
                    val sqsClient = SqsClient.builder()
                        .region(region)
                        .credentialsProvider(DefaultCredentialsProvider.create())
                        .build()

                    val recipeBody = inputAsJson["recipe"].asText()

                    logger.info("Recipe Body: $recipeBody")

                    // make sure we can read this input as a Recipe before accepting it
                    val recipe = JacksonWrapper.readJson(recipeBody) as? Recipe
                    if (recipe != null) {
                        sqsClient.use {
                            val sendMsgRequest = SendMessageRequest.builder()
                                .queueUrl(newRecipeQueueUrl)
                                .messageBody(event.body)
                                .build()

                            val sqsResponse = sqsClient.sendMessage(sendMsgRequest)

                            with (response) {
                                statusCode = 202
                                body = "\"message\":\"Recipe was successfully sent to queue for additional handling. Assuming there " +
                                        "are no issues, it should start appearing in search results momentarily. " +
                                        "Message ID: ${sqsResponse.messageId()}\""
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
                    val user = inputAsJson["user"].asText()
                    if (user == userSub && recipeId != null) {
                        sqsClient.use {
                            val sendMsgRequest = SendMessageRequest.builder()
                                .queueUrl(deleteRecipeQueueUrl)
                                .messageBody(event.body)
                                .build()

                            val sqsResponse = sqsClient.sendMessage(sendMsgRequest)

                            with (response) {
                                statusCode = 200
                                body = "\"message\":\"${sqsResponse.messageId()}\""
                            }
                        }
                    }
                    else with (response) {
                        if (user != userSub) {
                            statusCode = 400
                            body = "Claims/Auth user sub does not match that of the request."
                        }
                        else {
                            statusCode = 422
                            body = "Failed to parse input."
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
}