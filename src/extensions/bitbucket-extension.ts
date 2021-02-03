import { GluegunToolbox, print } from 'gluegun'
import { APIClient, Bitbucket } from 'bitbucket'
import { isNil } from 'lodash'

// side effect
export let client: APIClient

interface IAuth {
  username: string
  password: string
}

export function getBitbucketClient(auth: IAuth) {
  return new Bitbucket({
    auth,
    request: {
      timeout: 20000
    }
  })
}

export async function testBitbucketCredential(auth: IAuth) {
  await getBitbucketClient(auth)
    .user.get({})
    .then(({ data }) => {
      if (isNil(data)) throw Error('can not access with ' + auth)
      else print.success(data)
    })
    .catch(print.error)
}

export async function isClientGood(toolbox: GluegunToolbox): Promise<boolean> {
  if (!isNil(client)) return true

  if (isNil(toolbox.config.credential)) {
    const { username, password } = await toolbox.prompt.ask([
      {
        type: 'input',
        name: 'username',
        message: 'enter bitbucket username'
      },
      {
        type: 'password',
        name: 'password',
        message: 'enter bitbucket password (stdin supported)'
      }
    ])

    Reflect.set(toolbox.config, 'credential', {
      bitbucket: { username, password }
    })

    toolbox.print.debug(toolbox.config.credential)

    //    client = getBitbucketClient({ username: String(username), password: String(password) })

    await testBitbucketCredential({
      username: String(username),
      password: String(password)
    })

    return true
  }

  return false
}

export default (toolbox: GluegunToolbox) => {
  toolbox.isClientGood = isClientGood
  toolbox.testBitbucketCredential = testBitbucketCredential
}
