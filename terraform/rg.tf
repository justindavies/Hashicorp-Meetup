# Create a resource group
resource "azurerm_resource_group" "terraformonazure" {
  name     = "${var.build_prefix}-test"
  location = "East US"
}
