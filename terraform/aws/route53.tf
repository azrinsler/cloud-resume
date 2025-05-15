resource "aws_route53_zone" "cloud_resume_route53" {
  name = var.site_name
}

# this 'A' record is what ties our domain name to whatever IP address it represents
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.cloud_resume_route53.zone_id
  name    = "www"
  type    = "A"

  alias {
    # specifically; it points to the IP address assigned to our site by cloudfront
    name = aws_cloudfront_distribution.cloud_resume_cloudfront.domain_name
    zone_id = aws_cloudfront_distribution.cloud_resume_cloudfront.hosted_zone_id
    evaluate_target_health = false
  }
}

# these additional records are used as part of ACM (certificateManager.tf) cert validation
resource "aws_route53_record" "cloud_resume_cert_records" {
  for_each = {
    for dvo in aws_acm_certificate.cloud_resume_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.cloud_resume_route53.zone_id
}

# this domain was registered manually since it involves a yearly registration cost or w/e, but!
# we can use Terraform to update its name servers to match those of our route53 hosted zone, in case they change
resource "aws_route53domains_registered_domain" "cloud_resume_domain" {
  domain_name = var.site_name

  # this makes the ASSUMPTION that AWS will always define exactly 4 name servers for us, per hosted zone
  name_server {
    name = aws_route53_zone.cloud_resume_route53.name_servers[0]
  }
  name_server {
    name = aws_route53_zone.cloud_resume_route53.name_servers[1]
  }
  name_server {
    name = aws_route53_zone.cloud_resume_route53.name_servers[2]
  }
  name_server {
    name = aws_route53_zone.cloud_resume_route53.name_servers[3]
  }
}