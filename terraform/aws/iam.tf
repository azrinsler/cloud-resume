# this iam role is used by lambda(s) to access other resources within AWS
resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# https://docs.aws.amazon.com/aws-managed-policy/latest/reference/policy-list.html
resource "aws_iam_role_policy_attachment" "lambda_basic_policy" {
  role       = aws_iam_role.lambda_exec.name
  for_each = toset([
    # this is an AWS managed policy which allows lambda(s) to write to cloudwatch logs...?
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    # uncertain what this policy is doing... something for SQS, clearly, but... it isn't giving sqs:SendMessage sooo...
    "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole",
    "arn:aws:iam::aws:policy/AmazonSQSFullAccess" # Granting full access seems like a bit much, though?
  ])
  policy_arn = each.key
}


