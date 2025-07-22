package azrinsler.aws

import JacksonWrapper
import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestStreamHandler
import com.amazonaws.services.lambda.runtime.events.SQSEvent
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
const val tableName = "" // todo
const val queueName = "" // todo
val region: Region = Region.US_EAST_1
val queueUrl = "https://sqs.$region.amazonaws.com/$accountId/$queueName"

@Suppress("unused") // Supported events: https://github.com/aws/aws-lambda-java-libs/blob/main/aws-lambda-java-events/README.md
class NewRecipeLambda : RequestStreamHandler {

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

        logger.info("Input String: $inputString")

        val inputJson = JacksonWrapper.readTree(inputString)
        val records = inputJson.get("records")

        logger.info("Records: $records")
    }

    fun handleRecord (record: SQSEvent.SQSMessage) {
        logger.info(record.body)
    }
}