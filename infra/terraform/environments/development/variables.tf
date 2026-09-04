variable "aiven_project_name" {
  description = "Existing Aiven project name."
  type        = string
}

variable "aiven_api_token" {
  description = "Aiven API token passed through an ignored tfvars file or TF_VAR_aiven_api_token."
  type        = string
  sensitive   = true
}

variable "aiven_cloud_name" {
  description = "Aiven cloud region for the service."
  type        = string
  default     = "do-nyc"
}

variable "mysql_service_name" {
  type    = string
  default = "node-erp-mysql-dev"
}

variable "mysql_plan" {
  type    = string
  default = "free"
}

variable "mysql_version" {
  type    = string
  default = "8.0"
}

variable "database_name" {
  type    = string
  default = "worldclass_erp"
}
