package azrinsler.aws

import JacksonWrapper
import Recipe
import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestStreamHandler
import io.opentelemetry.api.trace.Span
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import software.amazon.awssdk.regions.Region
import java.io.BufferedReader
import java.io.InputStream
import java.io.OutputStream
import kotlin.text.Charsets.UTF_8

const val accountId = "477850672676"
const val queueName = "" // todo
val region: Region = Region.US_EAST_1
val queueUrl = "https://sqs.$region.amazonaws.com/$accountId/$queueName"

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

        logger.trace("${this::class.simpleName} RequestHandler - Input received.")

        val inputString = input.bufferedReader(UTF_8).use(BufferedReader::readText)
        val inputJson = JacksonWrapper.readTree(inputString)
        val records = inputJson["Records"]

        logger.info("Records: ${records.size()}")

        for (record in records) {
            val recordJson = record["body"].asText()
            logger.info("Record Body: $recordJson")
            val recipe = JacksonWrapper.readJson(recordJson) as Recipe
            logger.info("Recipe: $recipe")
        }
    }
}