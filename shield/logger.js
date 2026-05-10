// shield/logger.js

import chalk from 'chalk'

const time = () => {
  return new Date().toLocaleTimeString()
}

export const logger = {

  info(text) {
    console.log(
      chalk.gray(`[${time()}]`) +
      ' ' +
      chalk.blue('ℹ INFO ') +
      chalk.white(text)
    )
  },

  success(text) {
    console.log(
      chalk.gray(`[${time()}]`) +
      ' ' +
      chalk.green('✅ SUCCESS ') +
      chalk.white(text)
    )
  },

  warning(text) {
    console.log(
      chalk.gray(`[${time()}]`) +
      ' ' +
      chalk.yellow('⚠ WARNING ') +
      chalk.white(text)
    )
  },

  error(text) {
    console.log(
      chalk.gray(`[${time()}]`) +
      ' ' +
      chalk.red('❌ ERROR ') +
      chalk.white(text)
    )
  },

  command(user, cmd) {
    console.log(
      chalk.gray(`[${time()}]`) +
      ' ' +
      chalk.magenta('⚡ CMD ') +
      chalk.cyan(user) +
      chalk.white(' → ') +
      chalk.yellow(cmd)
    )
  }

}
