import { NetworkPluginID, useWeb3State } from '../entry-web3'

export function useWeb3<SendOverrides, RequestOption>(
    expectedPluginID?: NetworkPluginID,
    overrides?: SendOverrides,
    options?: RequestOption,
) {
    const web3State = useWeb3State(expectedPluginID)
    return web3State.Protocol?.getWeb3?.(overrides, options) ?? null
}
