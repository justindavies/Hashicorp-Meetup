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
    frontend.image = "inklin/terraform_build:latest"

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
        `cd /terraform`,
        `/terraform init -backend-config="key=${gitSHA}"`,
        `/terraform apply -auto-approve`
    ]

    Group.runEach([frontend])
})


events.on("release", (brigadeEvent, project) => {
    console.log("Release called")
})

events.on("after", (brigadeEvent, project) => {

    const slackWebhook = project.secrets.slackWebhook
    // The boring stuff
    const azServicePrincipal = project.secrets.azServicePrincipal
    const azClientSecret = project.secrets.azClientSecret
    const azTenant = project.secrets.azTenant
    const azSubscription = project.secrets.azSubscription
    const azStorageKey = project.secrets.azStorageKey

    const gitPayload = JSON.parse(brigadeEvent.cause.event.payload)

    const gitSHA = brigadeEvent.revision.commit.substr(0, 7)


    const slack = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slack.env = {
        SLACK_WEBHOOK: slackWebhook,
        SLACK_USERNAME: "👷 Bob the Builder",
        SLACK_TITLE: `🎉 Push from ${gitPayload.ref} by @${gitPayload.pusher.name} completed succesfully`,
        SLACK_MESSAGE: `http://168.61.45.70/#!/build/${brigadeEvent.buildID}`
    }

    slack.run()


    // Deploy Infra 
    const frontend = new Job("job-runner-destroy")
    frontend.storage.enabled = false
    frontend.image = "inklin/terraform_build:latest"

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
        `cd /terraform`,
        `/terraform init -backend-config="key=${gitSHA}"`,
        `/terraform destroy -auto-approve`
    ]

    frontend.run()
})

events.on("error", (brigadeEvent, project) => { 
    const slackWebhook = project.secrets.slackWebhook
    // The boring stuff
    const azServicePrincipal = project.secrets.azServicePrincipal
    const azClientSecret = project.secrets.azClientSecret
    const azTenant = project.secrets.azTenant
    const azSubscription = project.secrets.azSubscription
    const azStorageKey = project.secrets.azStorageKey

    const gitPayload = JSON.parse(brigadeEvent.cause.event.payload)

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
    frontend.image = "inklin/terraform_build:latest"

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
        `cd /terraform`,
        `/terraform init -backend-config="key=${gitSHA}"`,
        `/terraform destroy -auto-approve`
    ]

    frontend.run()

})