const { events, Job, Group } = require('brigadier')

events.on("push", (brigadeEvent, project) => {

    // The boring stuff
    const azServicePrincipal = project.secrets.azServicePrincipal
    const azClientSecret = project.secrets.azClientSecret
    const azTenant = project.secrets.azTenant
    const azSubscription = project.secrets.azSubscription
    const azStorageKey = project.secrets.azStorageKey

    const gitPayload = JSON.parse(brigadeEvent.payload)

    const gitSHA = brigadeEvent.revision.commit.substr(0, 7)



    // Deploy Infra 
    const frontend = new Job("job-runner-test")
    frontend.storage.enabled = false
    frontend.image = "inklin/terraform"

    frontend.env = {
        "ARM_CLIENT_ID": azServicePrincipal,
        "ARM_CLIENT_SECRET": azClientSecret,
        "ARM_TENANT_ID": azTenant,
        "ARM_SUBSCRIPTION_ID": azSubscription,
        "ARM_ACCESS_KEY": azStorageKey,
        "TF_VAR_build_prefix": gitSHA,
        "TF_VAR_pusher": gitPayload.pusher.name,
        "TF_VAR_source": gitPayload.ref
    }


    frontend.tasks = [
        `cd /src/terraform`,
        `/terraform init -backend-config="key=${gitSHA}"`,
        `/terraform apply -auto-approve`
    ]

    Group.runEach([frontend])
})

events.on("release", (brigadeEvent, project) => {

    // The boring stuff
    const acrServer = project.secrets.acrServer
    const acrName = project.secrets.acrName
    const azServicePrincipal = project.secrets.azServicePrincipal
    const azClientSecret = project.secrets.azClientSecret
    const azTenant = project.secrets.azTenant
    const azSubscription = project.secrets.azSubscription
    const gitPayload = JSON.parse(brigadeEvent.payload)
    const today = new Date()

    const gitSHA = brigadeEvent.revision.commit.substr(0, 7)
    const imageTag = String(gitSHA)

    // The good stuff!
    const frontend = new Job("job-runner-release")
    frontend.storage.enabled = false
    frontend.image = "inklin/terraform"

    frontend.env = {
        "ARM_CLIENT_ID": azServicePrincipal,
        "ARM_CLIENT_SECRET": azClientSecret,
        "ARM_TENANT_ID": azTenant,
        "ARM_SUBSCRIPTION_ID": azSubscription,
        "ARM_ACCESS_KEY": azStorageKey
    }

    frontend.tasks = [
        `cd /src/terraform`,
        `ls`,
        `/terraform init -backend-config="key=production"`,
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


events.on("after", (brigadeEvent, project) => {
    //console.log(brigadeEvent)
    //console.log(project)
    const slackWebhook = project.secrets.slackWebhook
    const gitPayload = JSON.parse(brigadeEvent.cause.event.payload)

    const slack = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slack.env = {
        SLACK_WEBHOOK: slackWebhook,
        SLACK_USERNAME: "👷 Bob the Builder",
        SLACK_TITLE: `🎉 Push from ${gitPayload.ref} by @${gitPayload.pusher.name} completed succesfully`,
        SLACK_MESSAGE: `http://168.61.45.70/#!/build/${brigadeEvent.buildID}`
    }

    slack.run()
})


events.on("error", (brigadeEvent, project) => {
    const slackWebhook = project.secrets.slackWebhook
    // The boring stuff
    const azServicePrincipal = project.secrets.azServicePrincipal
    const azClientSecret = project.secrets.azClientSecret
    const azTenant = project.secrets.azTenant
    const azSubscription = project.secrets.azSubscription
    const azStorageKey = project.secrets.azStorageKey

    const gitPayload = JSON.parse(brigadeEvent.payload)

    const gitSHA = brigadeEvent.revision.commit.substr(0, 7)

    const slack = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slack.env = {
        SLACK_WEBHOOK: slackWebhook,
        SLACK_USERNAME: "👷 Bob the Builder",
        SLACK_TITLE: `💩 Push from ${gitPayload.ref} by @${gitPayload.pusher.name} failed`,
        SLACK_MESSAGE: `http://168.61.45.70/#!/build/${brigadeEvent.buildID}`
    }

    slack.run()

    // Deploy Infra 
    const frontend = new Job("job-runner-destroy")
    frontend.storage.enabled = false
    frontend.image = "inklin/terraform"

    frontend.env = {
        "ARM_CLIENT_ID": azServicePrincipal,
        "ARM_CLIENT_SECRET": azClientSecret,
        "ARM_TENANT_ID": azTenant,
        "ARM_SUBSCRIPTION_ID": azSubscription,
        "ARM_ACCESS_KEY": azStorageKey,
        "TF_VAR_build_prefix": gitSHA,
        "TF_VAR_pusher": gitPayload.pusher.name,
        "TF_VAR_source": gitPayload.ref
    }


    frontend.tasks = [
        `cd /src/terraform`,
        `/terraform init -backend-config="key=${gitSHA}"`,
        `/terraform destroy -auto-approve`
    ]

    frontend.run()

})