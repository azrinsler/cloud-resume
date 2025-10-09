# these values can be referenced from other tf files
locals {
  new_recipe_lambda_path = "${var.packaged_new_recipe_lambda_relative_root}/${var.new_recipe_lambda_artifact}-${var.new_recipe_lambda_version}.jar"
  delete_recipe_lambda_path = "${var.packaged_delete_recipe_lambda_relative_root}/${var.delete_recipe_lambda_artifact}-${var.delete_recipe_lambda_version}.jar"
  recipe_api_lambda_path = "${var.packaged_recipe_api_lambda_relative_root}/${var.recipe_api_lambda_artifact}-${var.recipe_api_lambda_version}.jar"
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