resource "aws_lambda_function" "cloud_resume_lambda" {
  function_name = var.cloud_resume_lambda_class
  s3_bucket = aws_s3_bucket.packaged_source_bucket.id
  s3_key    = aws_s3_object.cloud_resume_lambda_source.key
  # Supported Runtimes: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html#runtimes-supported
  runtime = "java21"
  handler = "azrinsler.aws.${var.cloud_resume_lambda_class}"
  source_code_hash = filebase64sha256(local.cloud_resume_lambda_path)
  role = aws_iam_role.lambda_exec.arn
  timeout = 15 // specified in seconds
}

resource "aws_cloudwatch_log_group" "cloud_resume_lambda_logs" {
  name = "/aws/lambda/${aws_lambda_function.cloud_resume_lambda.function_name}"
  retention_in_days = 30
}