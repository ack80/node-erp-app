output "mysql_host" {
  value = module.mysql.host
}

output "mysql_port" {
  value = module.mysql.port
}

output "mysql_user" {
  value = module.mysql.user
}

output "mysql_password" {
  value     = module.mysql.password
  sensitive = true
}

output "mysql_database" {
  value = module.mysql.database
}

output "mysql_uri" {
  value     = module.mysql.uri
  sensitive = true
}
