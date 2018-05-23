# Hashicorp-Meetup
Repository to demo Terraform on Azure for Hashicorp Meetup May 2018

## Create Storage account

For Terraform shared state, create a new resource group for the storage account backend

```bash
az group create -n hashicorp -l eastus
```

### Creatre Storage account

```bash
az storage account create -n judastate -g hashicorp
```

### Enable Service endpoints

Firstly you need to set the default policy on the 

```bash
az storage account update --name "judastate" --resource-group "hashicorp" --default-action Deny

```

```bash
subnetid=$(az network vnet subnet show --resource-group "hashicorp" --vnet-name "terraform" --name "default" --query id --output tsv)
```

```bash
echo $subnetid
/subscriptions/63bb1026-{snip}-8b343eefecb3/resourceGroups/hashicorp/providers/Microsoft.Network/virtualNetworks/terraform/subnets/default
```

```bash
az storage account network-rule add --resource-group "hashicorp" --account-name "judastate" --subnet $subnetid
CreationTime                      Kind     Location    Name       PrimaryLocation    ProvisioningState    ResourceGroup    SecondaryLocation    StatusOfPrimary    StatusOfSecondary
--------------------------------  -------  ----------  ---------  -----------------  -------------------  ---------------  -------------------  -----------------  -------------------
2018-05-23T08:39:56.662420+00:00  Storage  eastus      judastate  eastus             Succeeded            hashicorp        westus               available          available
```

## Create Service Principal

```bash
~ az ad sp create-for-rbac -o json
Retrying role assignment creation: 1/36
Retrying role assignment creation: 2/36
{
  "appId": "7c52386f-{snip}-e11c75dbd514",
  "displayName": "azure-cli-2018-05-23-13-19-45",
  "name": "http://azure-cli-2018-05-23-13-19-45",
  "password": "eb835646-{snip}-319bf8d53c83",
  "tenant": "72f988bf-{snip}-2d7cd011db47"
}
```


# Setup Brigade

```bash
helm init
$HELM_HOME has been configured at /Users/juda/.helm.

Tiller (the Helm server-side component) has been installed into your Kubernetes Cluster.
Happy Helming!
```

## Install Brigade

```bash
~ helm install -n brigade brigade/brigade --set rbac.enabled=false --set api.service.type=LoadBalancer
NAME:   brigade
LAST DEPLOYED: Wed May 23 15:04:56 2018
NAMESPACE: default
STATUS: DEPLOYED

RESOURCES:
==> v1/ServiceAccount
NAME                       SECRETS  AGE
brigade-brigade-api        1        1s
brigade-brigade-ctrl       1        1s
brigade-brigade-github-gw  1        1s
brigade-brigade-vacuum     1        1s
brigade-worker             1        1s

==> v1/Service
NAME                       TYPE          CLUSTER-IP   EXTERNAL-IP  PORT(S)         AGE
brigade-brigade-api        LoadBalancer  10.2.75.175  <pending>    7745:30828/TCP  1s
brigade-brigade-github-gw  LoadBalancer  10.2.81.96   <pending>    7744:31586/TCP  1s

==> v1beta1/Deployment
NAME                       DESIRED  CURRENT  UP-TO-DATE  AVAILABLE  AGE
brigade-brigade-api        1        1        1           0          1s
brigade-brigade-ctrl       1        1        1           0          1s
brigade-brigade-github-gw  1        1        1           0          1s

==> v1beta1/CronJob
NAME                    SCHEDULE  SUSPEND  ACTIVE  LAST SCHEDULE  AGE
brigade-brigade-vacuum  @hourly   False    0       <none>         1s

==> v1/Pod(related)
NAME                                        READY  STATUS             RESTARTS  AGE
brigade-brigade-api-79cb76696f-gsgst        0/1    ContainerCreating  0         1s
brigade-brigade-ctrl-5755f9b87c-5s57t       0/1    ContainerCreating  0         1s
brigade-brigade-github-gw-757f77f7fd-6lf58  0/1    ContainerCreating  0         1s


NOTES:
Brigade is now installed!

To find out about your newly configured system, run:

  $ helm status brigade
```

## Install Pipeline project

Create a Helm values file - this will be used to setup the Brigade project, as well as being a way to pass secrets outside of the code repository.

```json
project: "justindavies/Hashicorp-Meetup"
repository: "github.com/justindavies/Hashicorp-Meetup"
cloneURL: "https://github.com/justindavies/Hashicorp-Meetup"
sharedSecret: "MySuperSecretPassword"
github:
    token: "6057c2-{snip}-4e90e"
secrets:
    acrServer: "inklin.azurecr.io"
    acrName: "inklin"
    azServicePrincipal: "7c52386f-{snip}-e11c75dbd514"
    azClientSecret: "eb835646-{snip}-319bf8d53c83"
    azTenant: "72f988bf-{snip}-2d7cd011db47"
```


