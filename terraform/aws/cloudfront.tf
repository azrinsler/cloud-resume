# this cloudfront distribution is used in combination w/ route53 to provide access to our S3-hosted site
resource "aws_cloudfront_distribution" "cloud_resume_cloudfront" {
  origin {
    domain_name = aws_s3_bucket.cloud_resume_bucket.bucket_regional_domain_name
    origin_id = "S3-Origin"
  }

  aliases = ["www.${var.site_name}"]

  enabled = true
  default_root_object = var.site_homepage

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Origin"

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

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cloud_resume_cert.arn
    ssl_support_method = "sni-only" # sni is short for 'server name identification'
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  depends_on = [aws_acm_certificate.cloud_resume_cert]
}