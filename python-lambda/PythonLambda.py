import json
import logging
# boto3 is the amazon sdk for python. why is it named like that... uh, reasons?
# https://boto3.amazonaws.com/v1/documentation/api/latest/index.html
import boto3 as aws

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

dynamodb = aws.resource("dynamodb")
ipAddressTable = dynamodb.Table("SiteVisitors")

# https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html
# More on context: https://docs.aws.amazon.com/lambda/latest/dg/python-context.html
def lambda_handler(event, context):
    """
    Main Lambda handler function
    Parameters:
        event: Dict containing the Lambda function event data
        context: Lambda runtime context
    Returns:
        Dict containing a status message
    """
    try:
        logger.info("Python Lambda Handler - Event Received")
        event_body = event["Records"][0]["body"]
        logger.debug("Event Body: " + json.dumps(event_body))

        # event record body is passed along as an escaped JSON string within the overall JSON (parsed differently)
        ip_address = json.loads(event_body)["ipAddress"]
        logger.debug("IP Address: " + ip_address)

        logger.debug("Table Response:")
        table_response = ipAddressTable.get_item( Key={ "ip_address" : ip_address } )
        logger.debug(table_response)

        if "Item" not in table_response:
            logger.debug("No matching record found in table")
            return {
                "statusCode": 404,
                "body": json.dumps({
                    "status":"Not Found",
                    "message":"The specified IP Address was not found in DynamoDB."
                })
            }

        table_record = table_response["Item"]["ip_address"]
        logger.debug("Table Record Item: " + table_record)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "status":"succeeded",
                "message":"The specified IP Address already exists in DynamoDB."
            })
        }

    except Exception as e:
        logger.error(e)
        return {
            "statusCode": 400,
            "body": json.dumps({
                "status":"failed",
                "message":"failed to process request","detail":str(e)
            })
        }


# convenience in case we (for some reason) try to execute locally
if __name__ == "__main__":
    emptyEvent = []
    emptyContext = []
    lambda_handler(emptyEvent, emptyContext)