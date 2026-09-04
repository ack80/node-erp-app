variable "project_name" {
  description = "Aiven project that will contain the MySQL service."
  type        = string
}

variable "service_name" {
  description = "Aiven MySQL service name."
  type        = string
}

variable "cloud_name" {
  description = "Aiven cloud region."
  type        = string
  default     = "do-nyc"
}

variable "plan" {
  description = "Aiven service plan."
  type        = string
  default     = "free"
}

variable "mysql_version" {
  description = "MySQL major/minor version supported by Aiven."
  type        = string
  default     = "8.0"
}

variable "database_name" {
  description = "Application database created in the service."
  type        = string
  default     = "worldclass_erp"
}
