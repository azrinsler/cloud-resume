variable "site_bucket_name" {
  type = string
  default = "azrinsler-site-bucket"
}

variable "packaged_source_relative_root" {
  type = string
  default = "./cloud-resume-lambda/target"
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

variable "cloud_resume_lambda_class" {
  type = string
  default = "CloudResumeLambda"
}

variable "cloud_resume_lambda_artifact_name" {
  type = string
  default = "cloud-resume-lambda"
}

variable "cloud_resume_lambda_version" {
  type = string
  default = "OH-SNAPSHOT"
}