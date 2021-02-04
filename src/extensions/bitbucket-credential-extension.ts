import { GluegunToolbox } from 'gluegun'
import { IAuth } from './bitbucket-extension'
import { isNil, isString } from 'lodash'
import { Bitbucket } from 'bitbucket'

const credentialKey = 'credential'
const credentialFilename = `.${credentialKey}rc.yaml`
const credentialDir = process.cwd() + '/.config/'
const credentialPath = credentialDir + credentialFilename

export interface ICredential {
  profile: string
  username: string
  password: string
  default?: boolean
}

export async function testCredential(auth: IAuth) {
  return new Bitbucket({
    auth,
    request: { timeout: 20000 }
  }).user
    .get({})
    .then(({ data }) => data)
}

export async function createCredential({
  prompt,
  template,
  print
}: GluegunToolbox) {
  const { username, password } = await prompt.ask([
    {
      type: 'input',
      name: 'username',
      message: 'enter bitbucket username'
    },
    {
      type: 'password',
      name: 'password',
      message: 'enter bitbucket password'
    }
  ])

  const { profile } = await prompt.ask([
    {
      type: 'input',
      name: 'profile',
      message: 'enter credential profile name',
      initial: username
    }
  ])

  const { display_name } = await testCredential({ username, password })
  print.success('hello ' + display_name)

  await template.generate({
    template: 'credentialrc.ejs',
    target: credentialPath,
    props: { username, password, profile }
  })

  print.info('Generate credential file at ' + credentialPath)
}

export function isCredentialGood({ config }: GluegunToolbox): boolean {
  return [
    !isNil(config[credentialKey]),
    isString(config[credentialKey].username),
    isString(config[credentialKey].password)
  ].every(Boolean)
}

export async function loadCredentials(toolbox: GluegunToolbox): Promise<IAuth> {
  // load config
  toolbox.config = {
    ...toolbox.config.loadConfig(credentialKey, credentialDir)
  }

  // create new credential if not found
  if (!isCredentialGood(toolbox)) {
    toolbox.print.warning(
      'Credential file not found, we need to create once. please enter bitbucket credenial in the next step'
    )

    await createCredential(toolbox)
  } else {
    await testCredential({
      username: toolbox.config[credentialKey].username,
      password: toolbox.config[credentialKey].password
    })
  }

  return {
    username: toolbox.config[credentialKey].username,
    password: toolbox.config[credentialKey].password
  }
}

export default (toolbox: GluegunToolbox) => {
  toolbox.loadBitbucketCredential = loadCredentials
}
