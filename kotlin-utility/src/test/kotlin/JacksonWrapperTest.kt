import com.fasterxml.jackson.databind.JsonNode
import org.junit.jupiter.api.Assertions.assertAll
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import java.math.BigInteger

class JacksonWrapperTest
{
    @Test
    fun `Jackson Wrapper should be able to read JSON tree` () {
        val jsonInputString = MockInputs.apiGatewayHttpRequest()
        val jsonInput = JacksonWrapper.readTree(jsonInputString)
        val rawQueryNode = jsonInput["rawQueryString"]
        val rawQueryString = rawQueryNode.toString()
        val reqContextHttpNode = jsonInput["requestContext"]["http"]
        val reqContextHttpString = reqContextHttpNode.toString()
        // Make sure we can access information in the tree (as JSON Nodes) using array syntax
        assertAll(
            { assertTrue(rawQueryNode is JsonNode) },
            { assertTrue(rawQueryString.contains("parameter")) },
            { assertTrue(reqContextHttpNode is JsonNode) },
            { assertTrue(reqContextHttpString.contains(""""method":"POST"""")) },
        )
    }

    @Test
    fun `Jackson Wrapper should be able to read JSON String as dynamically typed Map` () {
        val jsonInputString = MockInputs.apiGatewayHttpRequest()
        val jsonInputMapped = JacksonWrapper.readJson(jsonInputString) as Map<*, *>
        val cookies = jsonInputMapped["cookies"] // intentionally NOT telling compiler what type to expect
        val requestContext = jsonInputMapped["requestContext"] as Map<*, *>
        val authentication = requestContext["authentication"] as Map<*, *>
        val clientCert = authentication["clientCert"] as Map<*, *>
        val validity = clientCert["validity"] as Map<*, *>
        val notBefore = validity["notBefore"] as String
        assertAll(
            // The mapper should be smart enough to know cookies is a List of Something (though not necessarily of what)
            { assertTrue(cookies is List<*>) },
            { assertTrue(notBefore.endsWith("GMT"))}
        )
    }

    @Test
    fun `Jackson Wrapper should be able to read Map as as a specific type` () {
        val jsonInputString = MockInputs.apiGatewayHttpRequest()
        val jsonInputMapped = JacksonWrapper.readJson(jsonInputString) as Map<*, *>
        val apiGatewayEvent = JacksonWrapper.readJson(jsonInputMapped) as MockInputs.ApiGatewayHttpRequest
        assertAll(
            { assertTrue(apiGatewayEvent.requestContext.timeEpoch > BigInteger.valueOf(1580000000000)) },
            // this is set to "true" in the mock input (should automatically be recognized as Boolean by the data class)
            { assertTrue(apiGatewayEvent.isBase64Encoded) }
        )
    }

    @Test
    fun `Jackson Wrapper should be able to read JSON String as a specific type` () {
        val jsonInputString = MockInputs.apiGatewayHttpRequest()
        val apiGatewayEvent = JacksonWrapper.readJson(jsonInputString) as MockInputs.ApiGatewayHttpRequest

        assertAll(
            { assertTrue(apiGatewayEvent.requestContext.timeEpoch > BigInteger.valueOf(1580000000000)) },
            // this is set to "true" in the mock input (should automatically be recognized as Boolean by the data class)
            { assertTrue(apiGatewayEvent.isBase64Encoded) }
        )
    }

    @Test
    fun `Jackson Wrapper should FAIL to read JSON String of the WRONG specific type` () {
        try {
            val jsonInputString = MockInputs.apiGatewayHttpRequest()
            JacksonWrapper.readJson(jsonInputString) as MockInputs.ApiGatewayHttpRequestContextAuthorizer
            assertTrue(false) // an exception should be thrown before this point
        }
        catch (e : Exception) {
            assertNotNull(e) // we expect an exception to be thrown here...
        }
    }
}

object MockInputs
{
    data class ApiGatewayHttpRequest (
        val version: String,
        val routeKey: String,
        val rawPath: String,
        val rawQueryString: String,
        val cookies: List<String>,
        val headers: Map<String,String>,
        val queryStringParameters: Map<String,String>,
        val requestContext: ApiGatewayHttpRequestContext,
        val body: String,
        val pathParameters: Map<String,String>,
        val isBase64Encoded: Boolean,
        val stageVariables: Map<String,String>
    )

    data class ApiGatewayHttpRequestContext (
        val accountId: BigInteger,
        val apiId: String,
        val authentication: ApiGatewayHttpRequestContextAuthentication,
        val authorizer: ApiGatewayHttpRequestContextAuthorizer,
        val domainName: String,
        val domainPrefix: String,
        val http: ApiGatewayHttpRequestContextHttpSection,
        val requestId: String,
        val routeKey: String,
        val stage: String,
        val time: String, // Timestamp
        val timeEpoch: BigInteger
    )

    data class ApiGatewayHttpRequestContextAuthentication (
        val clientCert: ApiGatewayHttpRequestContextAuthenticationClientCert
    )

    data class ApiGatewayHttpRequestContextAuthenticationClientCert(
        val clientCertPem: String,
        val subjectDN: String,
        val issuerDN: String,
        val serialNumber: String,
        val validity: ApiGatewayHttpRequestContextAuthenticationClientCertValidity
    )

    data class ApiGatewayHttpRequestContextAuthenticationClientCertValidity(
        val notBefore: String, // Date
        val notAfter: String // Date
    )

    data class ApiGatewayHttpRequestContextAuthorizer (
        val jwt: ApiGatewayHttpRequestContextAuthorizerJwt
    )

    data class ApiGatewayHttpRequestContextAuthorizerJwt(
        val claims: Map<String, String>,
        val scopes: List<String>
    )

    data class ApiGatewayHttpRequestContextHttpSection (
        val method: String,
        val path: String,
        val protocol: String,
        val sourceIp: String,
        val userAgent: String
    )

    // this is based on a generic lambda test event from the AWS console
    fun apiGatewayHttpRequest () = """
        {
          "version": "2.0",
          "routeKey": "default",
          "rawPath": "/path/to/resource",
          "rawQueryString": "parameter1=value1&parameter1=value2&parameter2=value",
          "cookies": [
            "cookie1",
            "cookie2"
          ],
          "headers": {
            "Header1": "value1",
            "Header2": "value1,value2"
          },
          "queryStringParameters": {
            "parameter1": "value1,value2",
            "parameter2": "value"
          },
          "requestContext": {
            "accountId": "123456789012",
            "apiId": "api-id",
            "authentication": {
              "clientCert": {
                "clientCertPem": "CERT_CONTENT",
                "subjectDN": "www.example.com",
                "issuerDN": "Example issuer",
                "serialNumber": "a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1",
                "validity": {
                  "notBefore": "May 28 12:30:02 2019 GMT",
                  "notAfter": "Aug  5 09:36:04 2021 GMT"
                }
              }
            },
            "authorizer": {
              "jwt": {
                "claims": {
                  "claim1": "value1",
                  "claim2": "value2"
                },
                "scopes": [
                  "scope1",
                  "scope2"
                ]
              }
            },
            "domainName": "id.execute-api.us-east-1.amazonaws.com",
            "domainPrefix": "id",
            "http": {
              "method": "POST",
              "path": "/path/to/resource",
              "protocol": "HTTP/1.1",
              "sourceIp": "192.168.0.1/32",
              "userAgent": "agent"
            },
            "requestId": "id",
            "routeKey": "default",
            "stage": "default",
            "time": "12/Mar/2020:19:03:58 +0000",
            "timeEpoch": 1583348638390
          },
          "body": "eyJ0ZXN0IjoiYm9keSJ9",
          "pathParameters": {
            "parameter1": "value1"
          },
          "isBase64Encoded": true,
          "stageVariables": {
            "stageVariable1": "value1",
            "stageVariable2": "value2"
          }
        }
    """.trimIndent()
}