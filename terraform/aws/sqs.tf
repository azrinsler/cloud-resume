resource "aws_sqs_queue" "save_recipe_lambda_queue" {
  name                       = "save-recipe-input-queue"
  message_retention_seconds  = 86400
  max_message_size           = 32 * 1024# 32 KB
  delay_seconds              = 0
  receive_wait_time_seconds  = 0
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.save_recipe_lambda_dlq.arn
    maxReceiveCount     = 4
  })
}

resource "aws_sqs_queue" "save_recipe_lambda_dlq" {
  name = "save-recipe-dlq"
}

resource "aws_sqs_queue_redrive_allow_policy" "save_recipe_lambda_queue_redrive_allow_policy" {
  queue_url = aws_sqs_queue.save_recipe_lambda_dlq.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.save_recipe_lambda_queue.arn]
  })
}

resource "aws_sqs_queue" "delete_recipe_lambda_queue" {
  name                       = "delete-recipe-input-queue"
  message_retention_seconds  = 86400
  max_message_size           = 32 * 1024# 32 KB
  delay_seconds              = 0
  receive_wait_time_seconds  = 0
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.delete_recipe_lambda_dlq.arn
    maxReceiveCount     = 4
  })
}

resource "aws_sqs_queue" "delete_recipe_lambda_dlq" {
  name = "delete-recipe-dlq"
}

resource "aws_sqs_queue_redrive_allow_policy" "delete_recipe_lambda_queue_redrive_allow_policy" {
  queue_url = aws_sqs_queue.delete_recipe_lambda_dlq.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.delete_recipe_lambda_queue.arn]
  })
}

resource "aws_sqs_queue" "new_recipe_input_queue" {
  name                       = "new-recipe-input-queue"
  message_retention_seconds  = 86400
  max_message_size           = 32 * 1024 # 32 KB
  delay_seconds              = 0
  receive_wait_time_seconds  = 0
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.new_recipe_input_dlq.arn
    maxReceiveCount     = 4
  })
}

resource "aws_sqs_queue" "new_recipe_input_dlq" {
  name = "new-recipe-input-dlq"
}

resource "aws_sqs_queue_redrive_allow_policy" "new_recipe_lambda_queue_redrive_allow_policy" {
  queue_url = aws_sqs_queue.save_recipe_lambda_dlq.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.new_recipe_input_queue.arn]
  })
}