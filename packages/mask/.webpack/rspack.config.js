import { createConfiguration } from './config.js'
export default async function (cli_env) {
    const flags = JSON.parse(Buffer.from(cli_env.flags, 'hex').toString('utf-8'))
    return createConfiguration(true, flags)
}
