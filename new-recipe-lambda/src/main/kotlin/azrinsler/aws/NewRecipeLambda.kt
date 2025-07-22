package azrinsler.aws

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.SQSEvent
import io.opentelemetry.api.trace.Span
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import software.amazon.awssdk.regions.Region

const val accountId = "477850672676"
const val tableName = "" // todo
const val queueName = "" // todo
val region: Region = Region.US_EAST_1
val queueUrl = "https://sqs.$region.amazonaws.com/$accountId/$queueName"

@Suppress("unused") // Supported events: https://github.com/aws/aws-lambda-java-libs/blob/main/aws-lambda-java-events/README.md
class NewRecipeLambda : RequestHandler<SQSEvent, Unit> {

    val logger : Logger = LoggerFactory.getLogger(this::class.java)

    override fun handleRequest(event: SQSEvent, context: Context) {
        // OpenTelemetry span context information - helps AWS correlate logs to traces
        val span = Span.current()
        if (span.spanContext.isValid) {
            MDC.put("traceId", span.spanContext.traceId)
            MDC.put("spanId", span.spanContext.spanId)
        }

        logger.trace("${this::class.simpleName} RequestHandler - SQSEvent received.")

        event.records.forEach { record ->
            handleRecord(record)
        }
    }

    fun handleRecord (record: SQSEvent.SQSMessage) {
        logger.info(record.body)
    }
}