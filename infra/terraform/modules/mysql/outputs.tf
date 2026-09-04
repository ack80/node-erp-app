output "host" {
  value = aiven_mysql.this.service_host
}

output "port" {
  value = aiven_mysql.this.service_port
}

output "user" {
  value = aiven_mysql.this.service_username
}

output "password" {
  value     = aiven_mysql.this.service_password
  sensitive = true
}

output "database" {
  value = aiven_mysql_database.app_db.database_name
}

output "uri" {
  value     = aiven_mysql.this.service_uri
  sensitive = true
}
