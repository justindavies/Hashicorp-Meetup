const { events, Job, Group } = require('brigadier')

events.on("push", (brigadeEvent, project) => {

    // The boring stuff
    const acrServer = project.secrets.acrServer
    const acrName = project.secrets.acrName
    const azServicePrincipal = project.secrets.azServicePrincipal
    const azClientSecret = project.secrets.azClientSecret
    const azTenant = project.secrets.azTenant
    const gitPayload = JSON.parse(brigadeEvent.payload)
    const today = new Date()

    const gitSHA = brigadeEvent.revision.commit.substr(0,7)
    const imageTag = String(gitSHA)

    // The good stuff
    const frontend = new Job("job-runner-test")
    frontend.storage.enabled = false
    frontend.image = "inklin/terraform"
    frontend.tasks = [
        `az login --service-principal -u ${azServicePrincipal} -p ${azClientSecret} --tenant ${azTenant}`,
        `cd /src/terraform`,
        `ls`,
        `/terraform init`,
        `/terraform apply -auto-approve`

    ]

    // const frontend_helm = new Job("job-runner-frontend-helm")
    // frontend_helm.storage.enabled = false
    // frontend_helm.image = "lachlanevenson/k8s-helm:v2.8.2"
    // frontend_helm.tasks = [
    //     `helm upgrade --install --reuse-values frontend ./src/Charts/frontend --set image=${acrServer}/frontend --set imageTag=${imageTag}`
    // ]


    Group.runEach([frontend])



})

