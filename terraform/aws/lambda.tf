# KOTLIN LAMBDA
# the actual runtime for this function is Kotlin, but it compiles to Java and that's what AWS cares about
resource "aws_lambda_function" "kotlin_lambda_function" {
  function_name = var.kotlin_lambda_class
  s3_bucket = aws_s3_bucket.packaged_source_bucket.id
  s3_key    = aws_s3_object.kotlin_lambda_source.key
  # Supported Runtimes: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html#runtimes-supported
  runtime = "java21"
  handler = "azrinsler.aws.${var.kotlin_lambda_class}"
  source_code_hash = filebase64sha256(local.kotlin_lambda_path)
  role = aws_iam_role.lambda_exec.arn
  timeout = 30 // specified in seconds
  // memory defaults to 128 which is too small for a Kotlin function using heavy dependencies like aws sdk and jackson
  // (by setting this to a higher value we can VASTLY improve our cold start times, in particular)
  memory_size = 1024 // specified in MB
  snap_start {
    apply_on = "PublishedVersions" // snap start improves cold start times but only works for specific runtimes/regions
  }
}

# gives permission for api gateway to invoke the kotlin lambda
resource "aws_lambda_permission" "gateway_kotlin_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.kotlin_lambda_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.primary_gateway.execution_arn}/*/*"
}

# RECIPE LAMBDA
# the actual runtime for this function is Kotlin, but it compiles to Java and that's what AWS cares about
resource "aws_lambda_function" "recipe_lambda_function" {
  function_name = var.recipe_lambda_class
  s3_bucket = aws_s3_bucket.packaged_source_bucket.id
  s3_key    = aws_s3_object.recipe_lambda_source.key
  # Supported Runtimes: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html#runtimes-supported
  runtime = "java21"
  handler = "azrinsler.aws.${var.recipe_lambda_class}"
  source_code_hash = filebase64sha256(local.recipe_lambda_path)
  role = aws_iam_role.lambda_exec.arn
  timeout = 30 // specified in seconds
  // memory defaults to 128 which is too small for a Kotlin function using heavy dependencies like aws sdk and jackson
  // (by setting this to a higher value we can VASTLY improve our cold start times, in particular)
  memory_size = 1024 // specified in MB

  snap_start {
    apply_on = "PublishedVersions" // snap start improves cold start times but only works for specific runtimes/regions
  }

  tracing_config {
    mode = "Active" # Enables AWS X-Ray tracing
  }

  environment {
    AWS_LAMBDA_EXEC_WRAPPER = "/opt/otel-stream-handler" # Used by the ADOT Layer to wrap the handler (wrapper layer)
  }

  # This is the AWS ADOT layer (aws distro for open telemetry)
  layers = [
    "arn:aws:lambda:us-east-1:901920570463:layer:aws-otel-java-wrapper-arm64-ver-1-32-0:6"
  ]
}

# gives permission for api gateway to invoke the kotlin lambda
resource "aws_lambda_permission" "gateway_recipe_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recipe_lambda_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.primary_gateway.execution_arn}/*/*"
}

# PYTHON LAMBDA
data "archive_file" "python_lambda_package" {
  type = "zip"
  source_file = "${var.packaged_python_relative_root}/PythonLambda.py"
  output_path = "${var.packaged_python_relative_root}/python_lambda.zip"
}
resource "aws_lambda_function" "python_lambda_function" {
  function_name = "PythonLambda"
  filename      = "${var.packaged_python_relative_root}/python_lambda.zip"
  source_code_hash = data.archive_file.python_lambda_package.output_base64sha256
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "python3.13"
  handler       = "PythonLambda.lambda_handler"
  timeout       = 10 // specified in seconds
}

# Event source from SQS
resource "aws_lambda_event_source_mapping" "python_lambda_sqs_event_source_mapping" {
  event_source_arn = aws_sqs_queue.python_lambda_queue.arn
  function_name    = aws_lambda_function.python_lambda_function.arn
}