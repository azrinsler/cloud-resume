variable "site_bucket_name" {
  type = string
  default = "azrinsler-site-bucket"
}

variable "cookbook_bucket_name" {
  type = string
  default = "azrinsler-cookbook"
}

variable "packaged_kotlin_relative_root" {
  type = string
  default = "./kotlin-lambda/target"
}

variable "packaged_get_recipe_relative_root" {
  type = string
  default = "./get-recipe-lambda/target"
}

variable "packaged_python_relative_root" {
  type = string
  default = "./python-lambda"
}

variable "packaged_source_bucket_name" {
  type = string
  default = "azrinsler-packaged-source"
}

variable "site_relative_root" {
  type = string
  default = "./site"
}

variable "cookbook_relative_root" {
  type = string
  default = "./react-web-app"
}

variable "site_name" {
  type = string
  default = "azrinsler.com"
}

variable "site_homepage" {
  type = string
  default = "index.html"
}

variable "kotlin_lambda_class" {
  type = string
  default = "KotlinLambda"
}

variable "get_recipe_lambda_class" {
  type = string
  default = "GetRecipeLambda"
}

variable "kotlin_lambda_artifact" {
  type = string
  default = "kotlin-lambda"
}

variable "get_recipe_lambda_artifact" {
  type = string
  default = "get-recipe-lambda"
}

variable "kotlin_lambda_version" {
  type = string
  default = "OH-SNAPSHOT"
}

variable "get_recipe_lambda_version" {
  type = string
  default = "O"
}