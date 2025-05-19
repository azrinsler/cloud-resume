import json
import logging
# boto3 is the amazon sdk for python. why is it named like that... uh, reasons?
# https://boto3.amazonaws.com/v1/documentation/api/latest/index.html
import boto3 as aws
from botocore.exceptions import ClientError

TABLE_NAME = "SiteVisitors"

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

dynamodb = aws.resource("dynamodb")
ipAddressTable = dynamodb.Table(TABLE_NAME)

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
        ip_address = json.loads(event_body)["ip_address"]
        logger.debug("IP Address: " + ip_address)

        logger.debug("Table Response:")
        table_response = ipAddressTable.get_item( Key={ "ip_address" : ip_address } )
        logger.debug(table_response)

        if "Item" not in table_response:
            logger.debug("No matching record found in table. IP Address will be added to DB.")
            # since this IP wasn't found --- put it to the table so it IS found in the future
            try:
                ipAddressTable.put_item( Item={ "ip_address" : ip_address, "visit_counter" : 1 } )
            except ClientError as client_e:
                logger.error(
                    "Failed to add IP Address %s to table %s. Here's why: %s: %s",
                    ip_address,
                    TABLE_NAME,
                    client_e.response["Error"]["Code"],
                    client_e.response["Error"]["Message"],
                )
                raise

            return {
                "statusCode": 201,
                "body": json.dumps({
                    "status":"Created",
                    "message":"The specified IP Address has been added to DynamoDB."
                })
            }

        visit_counter = table_response["Item"]["visit_counter"]
        logger.debug("This IP already exists in the DB. Visit Counter: " + str(visit_counter))
        visit_counter = visit_counter + 1

        try:
            ipAddressTable.put_item( Item={ "ip_address" : ip_address, "visit_counter" : visit_counter } )
        except ClientError as client_e:
            logger.error(
                "Failed to increment visit_counter for ip_address %s in table %s. Here's why: %s: %s",
                ip_address,
                TABLE_NAME,
                client_e.response["Error"]["Code"],
                client_e.response["Error"]["Message"],
            )
            raise

        return {
            "statusCode": 200,
            "body": json.dumps({
                "status":"succeeded",
                "message":"The specified IP Address already exists in DynamoDB. It's visit_counter has increased to: " + str(visit_counter)
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