import { GluegunToolbox } from 'gluegun'
import { APIClient, Bitbucket } from 'bitbucket'

// side effect
export let client: APIClient

export interface IAuth {
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

export default (toolbox: GluegunToolbox) => {
  toolbox.setupBitbucketCredential = async () => {
    const { username, password } = await toolbox.loadBitbucketCredential(
      toolbox
    )
    client = getBitbucketClient({ username, password })
  }
}
