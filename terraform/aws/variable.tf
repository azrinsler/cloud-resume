variable "cookbook_bucket_name" {
  type = string
  default = "azrinsler-cookbook"
}

variable "packaged_delete_recipe_lambda_relative_root" {
  type = string
  default = "./delete-recipe-lambda/target"
}

variable "packaged_recipe_api_lambda_public_relative_root" {
  type = string
  default = "./recipe-api-lambda-public/target"
}

variable "packaged_recipe_api_lambda_user_relative_root" {
  type = string
  default = "./recipe-api-lambda-user/target"
}

variable "packaged_save_recipe_lambda_relative_root" {
  type = string
  default = "./save-recipe-lambda"
}

variable "packaged_source_bucket_name" {
  type = string
  default = "azrinsler-packaged-source"
}

variable "cookbook_relative_root" {
  type = string
  default = "./cookbook/dist"
}

variable "site_name" {
  type = string
  default = "azrinsler.com"
}

variable "site_homepage" {
  type = string
  default = "index.html"
}

variable "delete_recipe_lambda_class" {
  type = string
  default = "DeleteRecipeLambda"
}

variable "recipe_api_lambda_public_class" {
  type = string
  default = "RecipeApiLambdaPublic"
}

variable "recipe_api_lambda_user_class" {
  type = string
  default = "RecipeApiLambdaUser"
}

variable "delete_recipe_lambda_artifact" {
  type = string
  default = "delete-recipe-lambda"
}

variable "recipe_api_lambda_public_artifact" {
  type = string
  default = "recipe-api-lambda-public"
}

variable "recipe_api_lambda_user_artifact" {
  type = string
  default = "recipe-api-lambda-user"
}

variable "delete_recipe_lambda_version" {
  type = string
  default = "O"
}

variable "recipe_api_lambda_public_version" {
  type = string
  default = "O"
}

variable "recipe_api_lambda_user_version" {
  type = string
  default = "O"
}