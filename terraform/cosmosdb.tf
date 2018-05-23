resource "azurerm_cosmosdb_account" "cosmosdb" {
  name                = "${var.build_prefix}-db"
  location            = "${azurerm_resource_group.terraformonazure.location}"
  resource_group_name = "${azurerm_resource_group.terraformonazure.name}"
  offer_type          = "Standard"
  kind                = "MongoDB"

  consistency_policy {
    consistency_level = "Session"
  }

  failover_policy {
    location = "${azurerm_resource_group.terraformonazure.location}"
    priority = 0
  }

  tags {
    environment = "Test"
    owner       = "${var.pusher}"
    source      = "${var.source}"
    tier        = "storage"
  }
}

# primary_master_key 

