# these values can be references from other tf files
locals {
  cloud_resume_lambda_path = "${var.packaged_source_relative_root}/${var.cloud_resume_lambda_artifact_name}-${var.cloud_resume_lambda_version}.jar"
  mime_types = {
    "html" = "text/html"
    "png"  = "image/png"
    "jpg"  = "image/jpeg"
    "gif"  = "image/gif"
    "css"  = "text/css"
    "js"   = "application/javascript"
  }
}