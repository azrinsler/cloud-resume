# this cloudfront distribution is used in combination w/ route53 to provide access to our S3-hosted site
resource "aws_cloudfront_distribution" "primary_cloudfront_distro" {
  origin {
    domain_name = aws_s3_bucket.site_bucket.bucket_regional_domain_name
    origin_id = "Site-Origin"
  }
  origin {
    domain_name = aws_s3_bucket.cookbook_bucket.bucket_regional_domain_name
    origin_id = "Cookbook-Origin"
  }
  origin {
    domain_name = "${aws_apigatewayv2_api.primary_gateway.id}.execute-api.us-east-1.amazonaws.com"
    origin_id   = "API-Gateway"
    origin_path = "/${aws_apigatewayv2_stage.primary_gateway_stage.name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  aliases = [var.site_name, "www.${var.site_name}"]

  enabled = true
  default_root_object = var.site_homepage

  # for accessing the site (Site Origin)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "Site-Origin"

    viewer_protocol_policy = "redirect-to-https"

    min_ttl = 0
    default_ttl = 3600
    max_ttl = 86400

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # for accessing cookbook
  ordered_cache_behavior {
    path_pattern           = "/cookbook/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "Cookbook-Origin"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # for accessing api gateway
  ordered_cache_behavior {
    path_pattern           = "/${aws_apigatewayv2_stage.primary_gateway_stage.name}/*"
    allowed_methods        = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "API-Gateway"
    viewer_protocol_policy = "https-only"
    compress               = true

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.primary_cert.arn
    ssl_support_method = "sni-only" # sni is short for 'server name identification'
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  depends_on = [aws_acm_certificate_validation.primary_cert_validation]
}