terraform {
  backend "azurerm" {
    storage_account_name = "judastate"
    container_name       = "tfstate"
  }
}
