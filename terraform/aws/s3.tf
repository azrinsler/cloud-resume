/***************************************************************************/
/* S3 STUFFS FOR CONTAINING PACKAGED SOURCE FILES FOR LAMBDA'S TO RUN FROM */
/***************************************************************************/

# this bucket to hold packaged (zip) source files, primarily for any lambdas we create
resource "aws_s3_bucket" "packaged_source_bucket" {
  bucket = var.packaged_source_bucket_name
  force_destroy = true
}

# aws lambda requires source code be packaged w/ dependencies as a jar/zip file
resource "aws_s3_object" "cloud_resume_lambda_source" {
  bucket = aws_s3_bucket.packaged_source_bucket.id
  key    = "${var.cloud_resume_lambda_artifact_name}.zip"
  source = local.cloud_resume_lambda_path
  etag = filemd5(local.cloud_resume_lambda_path)
}

/**********************************************/
/* S3 STUFFS FOR CLOUD RESUME AWS HOSTED SITE */
/**********************************************/

# this bucket to hold the statically hosted cloud resume site files
resource "aws_s3_bucket" "cloud_resume_bucket" {
  bucket = var.site_bucket_name
  force_destroy = true
}

# this may or may not be required to apply bucket policy successfully... keeping it just in case
resource "aws_s3_bucket_public_access_block" "cloud_resume_access_block" {
  bucket = aws_s3_bucket.cloud_resume_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# enabling versioning should hopefully help encourage cloudfront to keep its cache up-to-date
resource "aws_s3_bucket_versioning" "cloud_resume_bucket_versioning" {
  bucket = aws_s3_bucket.cloud_resume_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# this IAM policy gets converted into a JSON string for our bucket_policy below
data "aws_iam_policy_document" "cloud_resume_bucket_iam" {
  statement {
    sid    = "PublicReadGetObject"
    effect = "Allow"
    resources = [
      aws_s3_bucket.cloud_resume_bucket.arn,
      "${aws_s3_bucket.cloud_resume_bucket.arn}/*"
    ]
    actions = ["s3:GetObject"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
  depends_on = [aws_s3_bucket_public_access_block.cloud_resume_access_block]
}
# it is necessary to grant public read access in order for the statically hosted site to work as expected
resource "aws_s3_bucket_policy" "cloud_resume_bucket_policy" {
  bucket = aws_s3_bucket.cloud_resume_bucket.id
  policy = data.aws_iam_policy_document.cloud_resume_bucket_iam.json
}

# tells aws that this bucket is hosting a static website
resource "aws_s3_bucket_website_configuration" "cloud_resume_site_config" {
  bucket = aws_s3_bucket.cloud_resume_bucket.id
  index_document {
    suffix =  var.site_homepage
  }
}

# this programmatically puts everything in the site folder up to S3, using file extension to determine content type
resource "aws_s3_object" "cloud_resume_site_content" {
  for_each = fileset(var.site_relative_root, "**")
  bucket = aws_s3_bucket.cloud_resume_bucket.id
  key = each.value
  source = "${var.site_relative_root}/${each.value}"
  etag = filemd5("${var.site_relative_root}/${each.value}")
  content_type = lookup(local.mime_types, regex("\\.([^.]+$)", each.key)[0], null)
}