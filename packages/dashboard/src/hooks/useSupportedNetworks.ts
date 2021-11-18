import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'

/** This is a temporary method that will be removed after support flow chain  */
export const useSupportedNetworks = () => {
    const plugins = getRegisteredWeb3Networks()

    return (
        plugins
            // TODO: support flow chain
            .filter((x) => x.networkSupporterPluginID !== 'com.maskbook.flow')
    )
}
