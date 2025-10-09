import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

object JacksonWrapper {
    val MAPPER = jacksonObjectMapper()
    init {
        with (MAPPER) {
            enable(JsonParser.Feature.ALLOW_COMMENTS)
            setSerializationInclusion(JsonInclude.Include.NON_NULL)
            setSerializationInclusion(JsonInclude.Include.NON_EMPTY)
            disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            disable(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES)
        }
    }

    @JvmStatic
    fun writeJson (it: Any) : String = MAPPER.writeValueAsString(it)

    @JvmStatic
    fun readTree (input: String) : JsonNode = MAPPER.readTree(input)

    @JvmStatic
    inline fun <reified T> readJson (input: String) : T = MAPPER.readValue(input, T::class.java)

    @JvmStatic
    inline fun <reified T> readJson (input: Map<*,*>) : T = readJson( writeJson(input) )
}