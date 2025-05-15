package azrinsler.aws

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

// Supported (built-in) events: https://github.com/aws/aws-lambda-java-libs/blob/main/aws-lambda-java-events/README.md
class CloudResumeLambda : RequestHandler<Map<*,*>, String> {
    override fun handleRequest(event: Map<*,*>, context: Context): String {
        val log = context.logger.also { it.log("Test Logger Message from Context") }
        try {
            log.log("Starting try block")
            val mapper = jacksonObjectMapper()
            log.log("Instantiated Object Mapper")
            val inputAsString = mapper.writeValueAsString(event)
            log.log(inputAsString)
            val inputAsJson = mapper.readTree(inputAsString)
            log.log("Parsed value from JSON tree: ${inputAsJson["test"].asText()}")
            return inputAsJson.toString()
        }
        catch (e: Exception) {
            log.log("Failure! ${e.message}")
            return "Failure! ${e.message}"
        }
    }
}