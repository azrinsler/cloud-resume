package azrinsler.aws

import JacksonWrapper
import Recipe
import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestStreamHandler
import io.opentelemetry.api.trace.Span
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.SendMessageRequest
import java.io.BufferedReader
import java.io.InputStream
import java.io.OutputStream
import kotlin.text.Charsets.UTF_8
import kotlin.use

const val accountId = "477850672676"
const val queueName = "save-recipe-input-queue"
val region: Region = Region.US_EAST_1
val saveRecipeQueueUrl = "https://sqs.$region.amazonaws.com/$accountId/$queueName"

@Suppress("unused") // Though this uses a generic RequestStreamHandler, it is intended for SQSEvent inputs
class NewRecipeLambda : RequestStreamHandler { // (the official SQSEvent apparently fails due to a casing mistake: Records vs. records)
    val logger : Logger = LoggerFactory.getLogger(this::class.java)

    override fun handleRequest(input : InputStream, output : OutputStream, context: Context) {
        // OpenTelemetry span context information - helps AWS correlate logs to traces
        val span = Span.current()
        if (span.spanContext.isValid) {
            MDC.put("traceId", span.spanContext.traceId)
            MDC.put("spanId", span.spanContext.spanId)
        }

        logger.trace("${this::class.simpleName} RequestStreamHandler - Input received.")

        val inputString = input.bufferedReader(UTF_8).use(BufferedReader::readText)
        val inputJson = JacksonWrapper.readTree(inputString)
        val records = inputJson["Records"]

        logger.info("Records: ${records.size()}")

        for (record in records) {
            val recordBody = record["body"].asText()
            logger.info("Record Body: $recordBody")
            val recipe = JacksonWrapper.readJson(recordBody) as Recipe



            // THIS IS WHERE WE WOULD DO OUR FANCY CHECKS AND/OR MODIFICATIONS BEFORE SENDING TO QUEUE, IF WE HAD ANY.



            val recipeJson = JacksonWrapper.writeJson(recipe)

            logger.info("Recipe JSON Output: $recipeJson")

            val sqsClient = SqsClient.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build()

            sqsClient.use {
                val sendMsgRequest = SendMessageRequest.builder()
                    .queueUrl(saveRecipeQueueUrl)
                    .messageBody(recipeJson)
                    .build()

                val sqsResponse = sqsClient.sendMessage(sendMsgRequest)

                logger.info("SQS Response Message ID: ${sqsResponse.messageId()}")
            }
        }
    }
}