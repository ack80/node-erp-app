resource "aiven_mysql" "this" {
  project       = var.project_name
  service_name  = var.service_name
  cloud_name    = var.cloud_name
  plan          = var.plan
  mysql_version = var.mysql_version
}

resource "aiven_mysql_database" "app_db" {
  project       = var.project_name
  service_name  = aiven_mysql.this.service_name
  database_name = var.database_name
}
