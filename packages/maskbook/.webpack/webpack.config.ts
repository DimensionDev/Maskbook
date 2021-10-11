import { createConfiguration } from './config'
export default async function (cli_env: any, argv: any) {
    const flags = JSON.parse(cli_env.flags)
    return createConfiguration(flags)
}
