# NEW RECIPE LAMBDA
# the actual runtime for this function is Kotlin, but it compiles to Java and that's what AWS cares about
resource "aws_lambda_function" "new_recipe_lambda_function" {
  function_name = var.new_recipe_lambda_class
  s3_bucket = aws_s3_bucket.packaged_source_bucket.id
  s3_key    = aws_s3_object.new_recipe_lambda_source.key
  # Supported Runtimes: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html#runtimes-supported
  runtime = "java21"
  handler = "azrinsler.aws.${var.new_recipe_lambda_class}::handleRequest"
  source_code_hash = filebase64sha256(local.new_recipe_lambda_path)
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
    variables = {
      # https://aws-otel.github.io/docs/getting-started/lambda/lambda-java (may want to try otel-proxy-handler at some point)
      AWS_LAMBDA_EXEC_WRAPPER = "/opt/otel-stream-handler" # Used by the ADOT Layer to wrap the handler (wrapper layer)
    }
  }

  architectures = ["arm64"]
  # This is the AWS ADOT layer (aws distro for open telemetry)
  layers = [
    "arn:aws:lambda:us-east-1:901920570463:layer:aws-otel-java-wrapper-arm64-ver-1-32-0:6"
  ]
}

# Event source from SQS
resource "aws_lambda_event_source_mapping" "new_recipe_lambda_sqs_event_source_mapping" {
  event_source_arn = aws_sqs_queue.new_recipe_input_queue.arn
  function_name    = aws_lambda_function.new_recipe_lambda_function.arn
}

# RECIPE API LAMBDA
# the actual runtime for this function is Kotlin, but it compiles to Java and that's what AWS cares about
resource "aws_lambda_function" "recipe_api_lambda_function" {
  function_name = var.recipe_api_lambda_class
  s3_bucket = aws_s3_bucket.packaged_source_bucket.id
  s3_key    = aws_s3_object.recipe_api_lambda_source.key
  # Supported Runtimes: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html#runtimes-supported
  runtime = "java21"
  handler = "azrinsler.aws.${var.recipe_api_lambda_class}::handleRequest"
  source_code_hash = filebase64sha256(local.recipe_api_lambda_path)
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
    variables = {
      # https://aws-otel.github.io/docs/getting-started/lambda/lambda-java (may want to try otel-proxy-handler at some point)
      AWS_LAMBDA_EXEC_WRAPPER = "/opt/otel-handler" # Used by the ADOT Layer to wrap the handler (wrapper layer)
    }
  }

  architectures = ["arm64"]
  # This is the AWS ADOT layer (aws distro for open telemetry)
  layers = [
    "arn:aws:lambda:us-east-1:901920570463:layer:aws-otel-java-wrapper-arm64-ver-1-32-0:6"
  ]
}

# gives permission for api gateway to invoke the recipe api lambda
resource "aws_lambda_permission" "gateway_recipe_api_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recipe_api_lambda_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.primary_gateway.execution_arn}/*/*"
}

# SAVE RECIPE LAMBDA
data "archive_file" "save_recipe_lambda_package" {
  type = "zip"
  source_file = "${var.packaged_save_recipe_lambda_relative_root}/SaveRecipeLambda.py"
  output_path = "${var.packaged_save_recipe_lambda_relative_root}/save_recipe_lambda.zip"
}
resource "aws_lambda_function" "save_recipe_lambda_function" {
  function_name = "SaveRecipeLambda"
  filename      = "${var.packaged_save_recipe_lambda_relative_root}/save_recipe_lambda.zip"
  source_code_hash = data.archive_file.save_recipe_lambda_package.output_base64sha256
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "python3.13"
  handler       = "SaveRecipeLambda.lambda_handler"
  timeout       = 10 // specified in seconds
}

# Event source from SQS
resource "aws_lambda_event_source_mapping" "save_recipe_lambda_sqs_event_source_mapping" {
  event_source_arn = aws_sqs_queue.save_recipe_lambda_queue.arn
  function_name    = aws_lambda_function.save_recipe_lambda_function.arn
}