# these values can be referenced from other tf files
locals {
  kotlin_lambda_path = "${var.packaged_kotlin_relative_root}/${var.kotlin_lambda_artifact}-${var.kotlin_lambda_version}.jar"
  recipe_lambda_path = "${var.packaged_recipe_lambda_relative_root}/${var.recipe_lambda_artifact}-${var.recipe_lambda_version}.jar"
  mime_types = {
    "html" = "text/html"
    "png"  = "image/png"
    "jpg"  = "image/jpeg"
    "gif"  = "image/gif"
    "css"  = "text/css"
    "js"   = "application/javascript"
    "pdf"  = "application/pdf"
    "svg"  = "image/svg+xml"
  }
}