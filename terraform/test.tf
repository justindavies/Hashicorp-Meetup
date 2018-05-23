resource "null_resource" "test" {
  provisioner "local-exec" {
    command = "curl -f -s http://${azurerm_container_group.aci-iexcompanies.ip_address}"
  }
}
