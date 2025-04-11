import { createConfiguration } from './config.ts'
export default async function (cli_env: any) {
    const flags = JSON.parse(Buffer.from(cli_env.flags, 'hex').toString('utf-8'))
    return createConfiguration(false, flags)
}
