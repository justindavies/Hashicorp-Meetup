# Create a resource group
resource "azurerm_resource_group" "terraformonazure" {
  name     = "terraformonazure"
  location = "East US"
}
