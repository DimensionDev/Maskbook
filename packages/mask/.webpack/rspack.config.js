import { createConfiguration } from './config.ts'
export default async function (/** @type {any} */ cli_env) {
    const flags = JSON.parse(Buffer.from(cli_env.flags, 'hex').toString('utf-8'))
    return createConfiguration(true, flags)
}
