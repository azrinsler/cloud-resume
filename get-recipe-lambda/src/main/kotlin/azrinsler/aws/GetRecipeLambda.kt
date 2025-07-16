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
                if (inputAsJson[recipeKey].isTextual)   inputAsJson[recipeKey].toString()
                else                                    inputAsJson[recipeKey].asText()

            if (recipeId.isEmpty())
                recipeId = UUID.randomUUID().toString()

            val dynamoDbClient = DynamoDbClient.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build()

            val queryRequest = QueryRequest.builder()
                .tableName("Recipes")
                .keyConditionExpression("recipe_id = :recipe_id")
                .expressionAttributeValues( mapOf(":recipe_id" to AttributeValue.builder().s("12345").build()) )
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

            log.log("Query Response: ${queryResponse.items()}")

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
                body =  if (queryResponse.items().isEmpty()) "No recipe with id $recipeId found"
                        else JacksonWrapper.readJson(queryResponse.items()[0])
            }
            return response
        }
        catch (e: Exception) {
            log.log("Failure! ${e.message}")
            throw e
        }
    }
}