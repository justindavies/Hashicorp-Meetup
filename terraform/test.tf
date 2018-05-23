resource "null_resource" "test" {
  provisioner "local-exec" {
    command = "curl -f http://${azurerm_container_group.aci-iexcompanies.ip_address}"
  }
}
