package azrinsler.aws

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException
import software.amazon.awssdk.services.dynamodb.model.QueryRequest
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

            // get IP address from input event
            val expectedKey = "ipAddress"
            val mapper = jacksonObjectMapper()
            val inputAsJson = mapper.readTree(event.body)

            if (inputAsJson[expectedKey] == null) {
                with (response) {
                    statusCode = 400 // "Bad Request"
                    body = "Input JSON is expected to contain value for key: $expectedKey"
                }
                return response
            }

            val ipAddress =
                if ( inputAsJson[expectedKey].isTextual )
                     inputAsJson[expectedKey].asText()  .also { log.log("$expectedKey is Textual --> using asText()") }
                else inputAsJson[expectedKey].toString().also { log.log("$expectedKey is NOT textual --> using toString()") }
            log.log("Retrieved IP Address Value: $ipAddress")

            // note: might add an ipv6 pattern as a future enhancement, but it is not currently a priority
            // this regex matches (1-3 digits).(1-3 digits).(1-3 digits).(1-3 digits) e.g., 192.168.1.1 or 47.403.86.47
            val ipv4Pattern = Regex("^((\\d){1,3}\\.){3}\\d{1,3}$")
            val isValidIPv4Address = ipv4Pattern.matches(ipAddress)
            log.log("IP Address appears to be valid IPv4 format: $isValidIPv4Address")

            // exit early if this doesn't appear to be a valid IPv4 address (sorry to those of you on IPv6 ones)
            if (!isValidIPv4Address) {
                with (response) {
                    statusCode = 422 // "Unprocessable Entry"
                    body = "This function currently only handles IPv4 Addresses."
                }
                return response
            }

            // sends the IP address to our Python function's queue for further processing
            val region = Region.US_EAST_1
            val accountId = "4778-5067-2676".replace("-","") // the dashes are only here to help w/ readability
            val tableName = "SiteVisitors"
            val queueName = "python-lambda-queue"
            val queueUrl = "https://sqs.${region}.amazonaws.com/$accountId/$queueName"

            // check to see if the IP already exists, so we can include that in our response
            val dynamoDbClient = DynamoDbClient.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build()

            val queryRequest = QueryRequest.builder()
                .tableName(tableName)
                .keyConditionExpression("ip_address = :ip")
                .expressionAttributeValues( mapOf(":ip" to AttributeValue.builder().s(ipAddress).build()) )
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
            val addressIsNew = queryResponse.items().isEmpty()
            val visitCounter =
                if (addressIsNew) 0
                else queryResponse.items()[0]["visit_counter"]?.n()?.toInt()

            log.log("Query Response: ${queryResponse.items()}")

            val sqsClient = SqsClient.builder()
                                     .region(region)
                                     .build()

            val request = SendMessageRequest.builder()
                                            .queueUrl(queueUrl)
                                            .messageBody(event.body)
                                            .build()

            sqsClient.use {
                try {
                    val sendMessageResponse: SendMessageResponse = sqsClient.sendMessage(request)
                    log.log("Message ID: ${sendMessageResponse.messageId()}")
                } catch (e: SqsException) {
                    log.log("Exception occurred sending message: ${e.message}")
                    throw e
                }
            }

            // respond to the original request after sending the message to queue
            with (response) {
                statusCode = 200
                body =
                    """
                    {
                        "message": "IP sent to SQS for additional processing. It will be added or incremented accordingly.",
                        "new_address": "$addressIsNew",
                        "prior_visits": "$visitCounter"
                    }
                    """.trimIndent()
            }
            return response
        }
        catch (e: Exception) {
            log.log("Failure! ${e.message}")
            throw e
        }
    }
}