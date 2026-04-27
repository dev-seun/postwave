variable "clerk_publishable_key" {
  type        = string
  description = "Public key for Clerk"
}

variable "clerk_secret_key" {
  type        = string
  description = "Secret key for Clerk"
  sensitive   = true
}

variable "api_base_url" {
  type        = string
  description = "The URL of your external backend API"
}