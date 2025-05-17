package azrinsler.aws

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.SendMessageRequest
import software.amazon.awssdk.services.sqs.model.SendMessageResponse
import software.amazon.awssdk.services.sqs.model.SqsException


// Supported (built-in) events: https://github.com/aws/aws-lambda-java-libs/blob/main/aws-lambda-java-events/README.md
class KotlinLambda : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    override fun handleRequest(event: APIGatewayProxyRequestEvent, context: Context): APIGatewayProxyResponseEvent {
        val log = context.logger.also { it.log("Kotlin Lambda Handler - API Gateway Proxy Request Event received.") }
        val response = APIGatewayProxyResponseEvent()
        try {
            log.log("Request Body: ${event.body}")


            // temporary test code --- remove me
            val mapper = jacksonObjectMapper()
            val inputAsJson = mapper.readTree(event.body)
            val testValue =
                if ( inputAsJson["test"].isTextual )
                     inputAsJson["test"].asText()  .also { log.log("testValue is Textual --> using asText()") }
                else inputAsJson["test"].toString().also { log.log("testValue is NOT textual --> using toString()") }
            log.log("Retrieved test value: $testValue")


            // send message body to SQS for further processing
            val region = Region.US_EAST_1
            val accountId = "4778-5067-2676".replace("-","")
            val queueUrl = "https://sqs.${region}.amazonaws.com/$accountId/python-lambda-queue"
            val sqsClient = SqsClient.builder()
                .region(region)
                .build()
            val request: SendMessageRequest? = SendMessageRequest.builder()
                .queueUrl(queueUrl)
                .messageBody(event.body)
                .build()
            try {
                val sendMessageResponse: SendMessageResponse = sqsClient.sendMessage(request)
                log.log("Message ID: ${sendMessageResponse.messageId()}")
            } catch (e: SqsException) {
                log.log("Exception occurred sending message: ${e.message}")
                throw RuntimeException(e)
            }
            finally {
                sqsClient.close()
            }

            // respond to the original request after sending the message to queue
            with (response) {
                statusCode = 200
                body = "Request body sent to SQS for further processing."
            }
            return response
        }
        catch (e: Exception) {
            log.log("Failure! ${e.message}")
            throw e
        }
    }
}