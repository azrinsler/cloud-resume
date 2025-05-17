variable "site_bucket_name" {
  type = string
  default = "azrinsler-site-bucket"
}

variable "packaged_kotlin_relative_root" {
  type = string
  default = "./kotlin-lambda/target"
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

variable "kotlin_lambda_artifact" {
  type = string
  default = "kotlin-lambda"
}

variable "kotlin_lambda_version" {
  type = string
  default = "OH-SNAPSHOT"
}