import { GluegunToolbox } from 'gluegun'
import { APIClient, Bitbucket } from 'bitbucket'
// import { ArrayPromptOptions } from 'gluegun/build/types/toolbox/prompt-enquirer-types'

// side effect
export let client: APIClient

export interface IAuth {
  username: string
  password: string
}

export async function selectRepos({ prompt, print }: GluegunToolbox) {
  const { data: workspaceResult } = await client.workspaces.getWorkspaces({
    fields: 'values.slug'
  })

  const { workspace } = await prompt.ask({
    type: 'select',
    name: 'workspace',
    message: 'select bitbucket workspace (slug)',
    choices: workspaceResult.values.map(({ slug }) => slug)
  })

  const { data: projectResult } = await client.workspaces.getProjects({
    workspace,
    fields: 'values.name,values.key'
  })

  const { project } = await prompt.ask({
    type: 'select',
    name: 'project',
    message: 'select bitbucket workspace project',
    choices: projectResult.values.map(({ key }) => key)
  })

  const { data: repoResult } = await client.repositories.list({
    workspace,
    fields: 'values.slug,values.name,values.uuid,values.project.key',
    q: `project.key = "${project}"`
  })

  // const repoQuestion: ArrayPromptOptions = {
  //   type: 'muliselect',
  //   name: 'repos',
  //   message: 'select bitbucket workspace project',
  //   choices: repoResult.values.map(({ name, uuid }) => ({ name, value: uuid }))
  // }

  const { repos } = await prompt.ask({
    type: 'select',
    multiple: true,
    scroll: true,
    name: 'repos',
    message: 'select bitbucket workspace project',
    choices: repoResult.values.map(({ name, uuid }) => ({
      name,
      message: name,
      value: uuid
    }))
  })

  print.debug(repos)
}

export default (toolbox: GluegunToolbox) => {
  toolbox.setupBitbucketCredential = async () => {
    const { username, password } = await toolbox.loadBitbucketCredential(
      toolbox
    )

    // override bitbucket instance
    client = new Bitbucket({
      auth: {
        username,
        password
      },
      request: {
        timeout: 20000
      }
    })

    await selectRepos(toolbox)
    // await getRelateRepos(toolbox, workspace)
  }
}
