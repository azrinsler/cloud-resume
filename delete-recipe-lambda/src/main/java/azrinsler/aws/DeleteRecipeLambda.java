package azrinsler.aws;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.opentelemetry.api.trace.Span;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;

import java.io.*;
import java.util.Map;

public class DeleteRecipeLambda implements RequestStreamHandler {
    private static final ObjectMapper jackson = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(DeleteRecipeLambda.class);
    static {
        jackson.enable(JsonParser.Feature.ALLOW_COMMENTS);
        jackson.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        jackson.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
        jackson.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        jackson.disable(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES);
    }
    Region region = Region.US_EAST_1;

    @Override
    public void handleRequest(InputStream inputStream, OutputStream outputStream, Context context) throws IOException {
        var span = Span.current();
        if (span.getSpanContext().isValid()) {
            MDC.put("traceId", span.getSpanContext().getTraceId());
            MDC.put("spanId", span.getSpanContext().getSpanId());
        }
        logger.trace("{} RequestStreamHandler - Input received", getClass().getSimpleName());

        var bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
        var inputString = new StringBuilder();
        var nextLine = bufferedReader.readLine();
        while (nextLine != null) {
            inputString.append(nextLine);
            nextLine = bufferedReader.readLine();
        }
        var input = inputString.toString();
        logger.info("Input: {}", input);
        var inputJson = jackson.readTree(input);
        var records = inputJson.get("Records");
        logger.info("Number of Records: {}", records.size());

        for (var record : records) {
            var recordBody = record.get("body").asText();
            logger.info("Record Body: {}", recordBody);
            var recordJson = jackson.readTree(recordBody);
            var recipeId = recordJson.get("recipeId").asText();
            logger.info("Recipe Id: {}", recipeId);

            try (var dynamoDb = DynamoDbClient.builder()
                    .region(region)
                    .build()) {

                var deleteRequest = DeleteItemRequest.builder()
                        .tableName("Recipes")
                        .key(Map.of("id", AttributeValue.builder().s(recipeId).build()))
                        .build();

                dynamoDb.deleteItem(deleteRequest);

                logger.info("Deleted Recipe {}", recipeId);
            }

            var returnMessage = "Recipe deleted successfully";
            outputStream.write(returnMessage.getBytes());
        }
    }
}

