# log group for "java" (kotlin) lambda
resource "aws_cloudwatch_log_group" "kotlin_lambda_logs" {
  name = "/aws/lambda/${aws_lambda_function.kotlin_lambda_function.function_name}"
  retention_in_days = 1
}

# log group for python lambda
resource "aws_cloudwatch_log_group" "python_lambda_logs" {
  name = "/aws/lambda/${aws_lambda_function.python_lambda_function.function_name}"
  retention_in_days = 1
}

# log group for api gateway
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.primary_gateway.name}"
  retention_in_days = 1
}