# ---------------------
# 1. Cognito User Pool
# ---------------------
resource "aws_cognito_user_pool" "main" {
  name = "cookbook-user-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  # Optional: user pool domain for hosted UI
  username_configuration {
    case_sensitive = false
  }

  mfa_configuration = "OFF"
}

# --------------------------
# 2. Cognito User Pool Client
# --------------------------
resource "aws_cognito_user_pool_client" "cookbook_client" {
  name         = "cookbook-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  allowed_oauth_flows             = ["code"]
  allowed_oauth_scopes            = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  callback_urls = [
    "https://www.${var.site_name}/"
  ]

  logout_urls = [
    "https://www.${var.site_name}/"
  ]

  supported_identity_providers = ["COGNITO"]

  prevent_user_existence_errors = "ENABLED"
}

# ---------------------
# 3. Cognito Domain
# ---------------------
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "cookbook-login"
  user_pool_id = aws_cognito_user_pool.main.id
}