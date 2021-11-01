import { createConfiguration } from './config'
export default async function (cli_env: any, argv: any) {
    const flags = JSON.parse(Buffer.from(cli_env.flags, 'hex').toString('utf-8'))
    return createConfiguration(flags)
}
