import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
    ['50360438371', 'El tío Judai', true]
]

global.botname = 'EMPIRE'
global.packname = 'EMPIRE BOT'
global.author = 'Judai'

global.prefix = /^[.#]/i

global.icons = {
    success: '✅',
    error: '❌',
    wait: '⏳',
    admin: '👑',
    bot: '🤖'
}

global.rpg = {
    initialMoney: 10
}

global.db = {
    data: {
        users: {},
        chats: {},
        settings: {}
    }
}

global.loadDatabase = async function () {
    return global.db
}

const file = fileURLToPath(import.meta.url)

watchFile(file, async () => {
    unwatchFile(file)

    console.log(
        chalk.redBright(
            "🛠️ Se actualizó config.js"
        )
    )

    await import(
        `${file}?update=${Date.now()}`
    )
})
