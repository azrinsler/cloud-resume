# this http api gateway can be connected to lambda's, etc.
resource "aws_apigatewayv2_api" "primary_gateway" {
  name          = "primary_api_gateway"
  protocol_type = "HTTP"
}

# each api gateway needs at least one stage - usually you would have multiple (i.e. prod and dev)
resource "aws_apigatewayv2_stage" "primary_gateway_stage" {
  api_id = aws_apigatewayv2_api.primary_gateway.id
  name = "primary_api_gateway_stage"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_logs.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    }
    )
  }
}

resource "aws_apigatewayv2_integration" "primary_gateway_kotlin_lambda_integration" {
  api_id = aws_apigatewayv2_api.primary_gateway.id
  integration_uri    = aws_lambda_function.kotlin_lambda_function.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "primary_gateway_kotlin_route" {
  api_id = aws_apigatewayv2_api.primary_gateway.id
  route_key = "POST /${aws_lambda_function.kotlin_lambda_function.function_name}"
  target    = "integrations/${aws_apigatewayv2_integration.primary_gateway_kotlin_lambda_integration.id}"
}

resource "aws_apigatewayv2_domain_name" "primary_gateway_domain_name" {
  domain_name = "api.${var.site_name}"
  domain_name_configuration {
    certificate_arn = aws_acm_certificate.primary_cert.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
  depends_on = [aws_acm_certificate_validation.primary_cert_validation]
}

