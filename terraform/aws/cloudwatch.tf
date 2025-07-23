# log group for new recipe (Kotlin) lambda
resource "aws_cloudwatch_log_group" "new_recipe_lambda_logs" {
  name = "/aws/lambda/${aws_lambda_function.new_recipe_lambda_function.function_name}"
  retention_in_days = 1
}

# log group for recipe api (Kotlin) lambda
resource "aws_cloudwatch_log_group" "recipe_api_lambda_logs" {
  name = "/aws/lambda/${aws_lambda_function.recipe_api_lambda_function.function_name}"
  retention_in_days = 1
}

# log group for save recipe (Python) lambda
resource "aws_cloudwatch_log_group" "save_recipe_lambda_logs" {
  name = "/aws/lambda/${aws_lambda_function.save_recipe_lambda_function.function_name}"
  retention_in_days = 1
}

# log group for api gateway
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.primary_gateway.name}"
  retention_in_days = 1
}