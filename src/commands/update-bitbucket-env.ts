import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'update-bitbucket-env',
  run: async toolbox => {
    const { print, config, isClientGood } = toolbox

    // const myConf = {
    //   ...config.loadConfig('credential', process.cwd() + './config/')
    // }

    print.debug(config.loadConfig('credential', process.cwd() + '/.config/'))

    print.info('Welcome to your CLI')

    await isClientGood(toolbox)
  }
}

module.exports = command
