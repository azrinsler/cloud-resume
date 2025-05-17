import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

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
        logger.debug("Event info: " + json.dumps(event))

        return {"statusCode": 200, "body": json.dumps({"status":"succeeded", "message":"this python function has tried nothing and succeeded spectacularly in doing so"})}
    except Exception as e:
        logger.error(e)
        return {"statusCode": 400,"body": json.dumps({"status":"failed", "message":"failed to process request","detail":str(e)})}


# convenience so we can execute locally
if __name__ == "__main__":
    emptyEvent = []
    emptyContext = []
    lambda_handler(emptyEvent, emptyContext)