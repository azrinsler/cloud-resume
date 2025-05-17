package azrinsler.aws

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

// Supported (built-in) events: https://github.com/aws/aws-lambda-java-libs/blob/main/aws-lambda-java-events/README.md
class KotlinLambda : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    override fun handleRequest(event: APIGatewayProxyRequestEvent, context: Context): APIGatewayProxyResponseEvent {
        val log = context.logger.also { it.log("Kotlin Lambda Handler - API Gateway Proxy Request Event received.") }
        val response = APIGatewayProxyResponseEvent()
        try {
            log.log("Request Body: ${event.body}")
            val mapper = jacksonObjectMapper()
            val inputAsJson = mapper.readTree(event.body)
            val testValue =
                if ( inputAsJson["test"].isTextual )
                     inputAsJson["test"].asText()  .also { log.log("testValue is Textual --> using asText()") }
                else inputAsJson["test"].toString().also { log.log("testValue is NOT textual --> using toString()") }
            log.log("Retrieved test value: $testValue")
            with (response) {
                statusCode = 200
                body = inputAsJson.toString()
            }
            return response
        }
        catch (e: Exception) {
            log.log("Failure! ${e.message}")
            throw e
        }
    }
}