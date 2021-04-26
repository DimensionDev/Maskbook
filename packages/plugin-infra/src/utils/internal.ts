import type { EthStatusReporter } from '../'
import { getPluginDefine } from '../manager/store'

/** @internal */
export function __meetEthChainRequirement(id: string, reporter: EthStatusReporter): boolean {
    const plugin = getPluginDefine(id)
    if (!plugin) return false

    const expectation = plugin.enableRequirement.eth
    if (!expectation) return true
    const current = reporter.current()

    // boolean | undefined
    const status = Boolean(expectation.chains[current])
    if (expectation.type === 'opt-in' && status !== true) return false
    if (expectation.type === 'opt-out' && status === true) return false
    return true
}
