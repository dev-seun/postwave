variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "postwave-dev"
}

variable "db_password" {
  type      = string
  sensitive = true
}

# Your .env variables
variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "clerk_issuer" {
  type = string
}

variable "clerk_secret_key" {
  type      = string
  sensitive = true
}

variable "clerk_jwks_url" {
  type = string
}