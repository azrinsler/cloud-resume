resource "aws_sqs_queue" "python_lambda_queue" {
  name                       = "python-lambda-queue"
  message_retention_seconds  = 86400
  max_message_size           = 32 * 1024# 32 KB
  delay_seconds              = 0
  receive_wait_time_seconds  = 0
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.python_lambda_dlq.arn
    maxReceiveCount     = 4
  })
}

resource "aws_sqs_queue" "python_lambda_dlq" {
  name = "python-lambda-dlq"
}

resource "aws_sqs_queue_redrive_allow_policy" "python_lambda_queue_redrive_allow_policy" {
  queue_url = aws_sqs_queue.python_lambda_dlq.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.python_lambda_queue.arn]
  })
}