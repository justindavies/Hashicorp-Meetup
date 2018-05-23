resource "null_resource" "test" {
  provisioner "local-exec" {
    command = "curl --retry-connrefused --retry --retry-delay 2 -m 60 -f -s http://${azurerm_container_group.aci-iexcompanies.ip_address}"
  }
}
