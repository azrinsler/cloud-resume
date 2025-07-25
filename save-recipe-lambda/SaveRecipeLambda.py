import json
import logging
# boto3 is the amazon sdk for python. why is it named like that... uh, reasons?
# https://boto3.amazonaws.com/v1/documentation/api/latest/index.html
import boto3 as aws
from botocore.exceptions import ClientError

TABLE_NAME = "Recipes"

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

dynamodb = aws.resource("dynamodb")
recipeTable = dynamodb.Table(TABLE_NAME)

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
        logger.info("Save Recipe Lambda Handler - Event Received")
        for record in event["Records"]:
            event_body = record["body"]
            logger.debug("Event Body: " + json.dumps(event_body))

            # event record body is passed along as an escaped JSON string within the overall JSON (parsed differently)
            recipe = json.loads(event_body)
            recipe_id = recipe["recipeId"]
            recipe_title = recipe["title"]
            recipe_title_plus_id = '"' + recipe_title + '" [' + recipe_id + ']'
            logger.debug("Recipe Title [ID]: " + recipe_title_plus_id)

            logger.debug("Table Response:")
            table_response = recipeTable.get_item(Key={"recipe_id" : recipe_id})
            logger.debug(table_response)

            if "Item" not in table_response:
                logger.debug("No matching recipe id found in table. Recipe will be added to DB.")
                try:
                    recipeTable.put_item(
                        Item={
                            "recipe_id" : recipe_id,
                            "title" : json.dumps(recipe_title),
                            "ingredients": json.dumps(recipe["ingredients"]),
                            "items": json.dumps(recipe["items"]),
                            "steps": json.dumps(recipe["steps"])
                        }
                    )

                except ClientError as client_e:
                    logger.error(
                        "Failed to add recipe %s to table %s. Here's why: %s: %s",
                        recipe_title_plus_id,
                        TABLE_NAME,
                        client_e.response["Error"]["Code"],
                        client_e.response["Error"]["Message"],
                    )
                    raise

            else:
                logger.debug("Recipe id already exists in the DB. Existing recipe will be updated.")
                try:
                    recipeTable.put_item(
                        Item={
                            "recipe_id" : recipe_id,
                            "title" : recipe_title,
                            "ingredients": recipe["ingredients"],
                            "items": recipe["items"],
                            "steps": recipe["steps"]
                        }
                    )

                except ClientError as client_e:
                    logger.error(
                        "Failed to update recipe %s in table %s. Here's why: %s: %s",
                        recipe_title_plus_id,
                        TABLE_NAME,
                        client_e.response["Error"]["Code"],
                        client_e.response["Error"]["Message"],
                    )
                    raise

        return {
            "statusCode": 200,
            "body": json.dumps({
                "status": "Succeeded",
                "message": "All records were processed successfully."
            })
        }

    except Exception as e:
        logger.error(e)
        raise


# convenience in case we (for some reason) try to execute locally
if __name__ == "__main__":
    emptyEvent = []
    emptyContext = []
    lambda_handler(emptyEvent, emptyContext)