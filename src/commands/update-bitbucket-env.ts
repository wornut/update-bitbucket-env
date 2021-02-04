import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'update-bitbucket-env',
  run: async toolbox => {
    const { print, setupBitbucketCredential } = toolbox

    print.info('update bitbucket env cli')

    await setupBitbucketCredential(toolbox)
  }
}

module.exports = command
