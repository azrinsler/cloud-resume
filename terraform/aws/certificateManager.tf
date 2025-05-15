# cloudformation requires a valid viewer certificate to create a distribution
resource "aws_acm_certificate" "cloud_resume_cert" {
  domain_name       = var.site_name
  validation_method = "DNS"
  subject_alternative_names = ["www.${var.site_name}", var.site_name]

  lifecycle {
    # preserves our cert in cases where this resource needs to be destroyed and recreated
    create_before_destroy = true
  }
}

# note: cert validation records can take some time and/or require manual steps to complete
resource "aws_acm_certificate_validation" "cloud_resume_cert_validation" {
  certificate_arn         = aws_acm_certificate.cloud_resume_cert.arn
  # fqdns here being short for 'fully qualified domain names'
  validation_record_fqdns = [for record in aws_route53_record.cloud_resume_cert_records : record.fqdn]
}