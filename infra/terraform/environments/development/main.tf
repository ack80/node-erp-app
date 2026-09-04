terraform {
  required_providers {
    aiven = {
      source  = "aiven/aiven"
      version = "~> 4.0"
    }
  }
}

provider "aiven" {
  api_token = var.aiven_api_token
}

module "mysql" {
  source        = "../../modules/mysql"
  project_name  = var.aiven_project_name
  service_name  = var.mysql_service_name
  cloud_name    = var.aiven_cloud_name
  plan          = var.mysql_plan
  mysql_version = var.mysql_version
  database_name = var.database_name
}
