/***************************************************************************/
/* S3 STUFFS FOR CONTAINING PACKAGED SOURCE FILES FOR LAMBDA'S TO RUN FROM */
/***************************************************************************/

# this bucket to hold packaged (zip) source files, primarily for any lambdas we create
resource "aws_s3_bucket" "packaged_source_bucket" {
  bucket = var.packaged_source_bucket_name
  force_destroy = true
}

# aws lambda requires source code be packaged w/ dependencies as a jar/zip file
resource "aws_s3_object" "kotlin_lambda_source" {
  bucket = aws_s3_bucket.packaged_source_bucket.id
  key    = "${var.kotlin_lambda_artifact}.zip"
  source = local.kotlin_lambda_path
  etag = filemd5(local.kotlin_lambda_path)
}

# aws lambda requires source code be packaged w/ dependencies as a jar/zip file
resource "aws_s3_object" "recipe_lambda_source" {
  bucket = aws_s3_bucket.packaged_source_bucket.id
  key    = "${var.recipe_lambda_artifact}.zip"
  source = local.recipe_lambda_path
  etag = filemd5(local.recipe_lambda_path)
}

/**********************************************/
/* S3 STUFFS FOR STATIC AWS HOSTED SITE */
/**********************************************/

# this bucket to hold the statically hosted site files
resource "aws_s3_bucket" "site_bucket" {
  bucket = var.site_bucket_name
  force_destroy = true
}

# this may or may not be required to apply bucket policy successfully... keeping it just in case
resource "aws_s3_bucket_public_access_block" "site_bucket_access_block" {
  bucket = aws_s3_bucket.site_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# enabling versioning should hopefully help encourage cloudfront to keep its cache up-to-date
resource "aws_s3_bucket_versioning" "site_bucket_versioning" {
  bucket = aws_s3_bucket.site_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# this IAM policy gets converted into a JSON string for our bucket_policy below
data "aws_iam_policy_document" "site_bucket_iam" {
  statement {
    sid    = "PublicReadGetObject"
    effect = "Allow"
    resources = [
      aws_s3_bucket.site_bucket.arn,
      "${aws_s3_bucket.site_bucket.arn}/*"
    ]
    actions = ["s3:GetObject"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
  depends_on = [aws_s3_bucket_public_access_block.site_bucket_access_block]
}
# it is necessary to grant public read access in order for the statically hosted site to work as expected
resource "aws_s3_bucket_policy" "site_bucket_policy" {
  bucket = aws_s3_bucket.site_bucket.id
  policy = data.aws_iam_policy_document.site_bucket_iam.json
}

# tells aws that this bucket is hosting a static website
resource "aws_s3_bucket_website_configuration" "site_bucket_site_config" {
  bucket = aws_s3_bucket.site_bucket.id
  index_document {
    suffix =  var.site_homepage
  }
}

# this programmatically puts everything in the site folder up to S3, using file extension to determine content type
resource "aws_s3_object" "site_bucket_content" {
  for_each = fileset(var.site_relative_root, "**")
  bucket = aws_s3_bucket.site_bucket.id
  key = each.value
  source = "${var.site_relative_root}/${each.value}"
  etag = filemd5("${var.site_relative_root}/${each.value}")
  content_type = lookup(local.mime_types, regex("\\.([^.]+$)", each.key)[0], null)
}

/**********************************************/
/* S3 STUFFS FOR REACT COOKBOOK */
/**********************************************/
# NOTE: COMMENTED OUT BECAUSE RIGHT NOW IT BASICALLY JUST UPLOADS THE MODULE AND NOT A FUNCTIONING SITE!
# this bucket to hold the statically hosted site files
resource "aws_s3_bucket" "cookbook_bucket" {
  bucket = var.cookbook_bucket_name
  force_destroy = true
}

# this may or may not be required to apply bucket policy successfully... keeping it just in case
resource "aws_s3_bucket_public_access_block" "cookbook_bucket_access_block" {
  bucket = aws_s3_bucket.cookbook_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# enabling versioning should hopefully help encourage cloudfront to keep its cache up-to-date
resource "aws_s3_bucket_versioning" "cookbook_bucket_versioning" {
  bucket = aws_s3_bucket.cookbook_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# this IAM policy gets converted into a JSON string for our bucket_policy below
data "aws_iam_policy_document" "cookbook_bucket_iam" {
  statement {
    sid    = "PublicReadGetObject"
    effect = "Allow"
    resources = [
      aws_s3_bucket.cookbook_bucket.arn,
      "${aws_s3_bucket.cookbook_bucket.arn}/*"
    ]
    actions = ["s3:GetObject"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
  depends_on = [aws_s3_bucket_public_access_block.cookbook_bucket_access_block]
}
# it is necessary to grant public read access in order for the statically hosted site to work as expected
resource "aws_s3_bucket_policy" "cookbook_bucket_policy" {
  bucket = aws_s3_bucket.cookbook_bucket.id
  policy = data.aws_iam_policy_document.cookbook_bucket_iam.json
}

# tells aws that this bucket is hosting a static website
resource "aws_s3_bucket_website_configuration" "cookbook_bucket_site_config" {
  bucket = aws_s3_bucket.cookbook_bucket.id
  index_document {
    suffix =  var.site_homepage
  }
}

# this programmatically puts everything in the site folder up to S3, using file extension to determine content type
resource "aws_s3_object" "cookbook_bucket_content" {
  for_each = fileset(var.cookbook_relative_root, "**")
  bucket = aws_s3_bucket.cookbook_bucket.id
  key = each.value
  source = "${var.cookbook_relative_root}/${each.value}"
  etag = filemd5("${var.cookbook_relative_root}/${each.value}")
  content_type = lookup(local.mime_types, regex("\\.([^.]+$)", each.key)[0], null)
}