variable "cookbook_bucket_name" {
  type = string
  default = "azrinsler-cookbook"
}

variable "packaged_new_recipe_lambda_relative_root" {
  type = string
  default = "./new-recipe-lambda/target"
}

variable "packaged_delete_recipe_lambda_relative_root" {
  type = string
  default = "./delete-recipe-lambda/target"
}

variable "packaged_recipe_api_lambda_relative_root" {
  type = string
  default = "./recipe-api-lambda/target"
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

variable "new_recipe_lambda_class" {
  type = string
  default = "NewRecipeLambda"
}

variable "delete_recipe_lambda_class" {
  type = string
  default = "DeleteRecipeLambda"
}

variable "recipe_api_lambda_class" {
  type = string
  default = "RecipeApiLambda"
}

variable "new_recipe_lambda_artifact" {
  type = string
  default = "new-recipe-lambda"
}

variable "delete_recipe_lambda_artifact" {
  type = string
  default = "delete-recipe-lambda"
}

variable "recipe_api_lambda_artifact" {
  type = string
  default = "recipe-api-lambda"
}

variable "new_recipe_lambda_version" {
  type = string
  default = "O"
}

variable "delete_recipe_lambda_version" {
  type = string
  default = "O"
}

variable "recipe_api_lambda_version" {
  type = string
  default = "O"
}