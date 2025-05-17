# this is the main entry point into Terraform, mostly defined here as a convenience so we can call it from the root dir
terraform {
  required_providers {
    # Hashicorp Docs for AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.97.0"
    }
  }
  # S3 backend configuration
  backend "s3" {
    bucket = "azrinsler-tfstate"
    key    = "terraform.tfstate"
    region = "us-east-1"
    encrypt = false
  }
}

provider "aws" {
  region  = "us-east-1"
}

# other terraform files are kept in a subdirectory to keep things somewhat organized
module "aws_module" {
  source = "./terraform/aws"
}