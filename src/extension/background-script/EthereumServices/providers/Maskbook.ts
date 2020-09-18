import Web3 from 'web3'
import type { HttpProvider } from 'web3-core'
import { getNetworkSettings } from '../../../../web3/settings'
import { currentLocalWalletEthereumNetworkSettings } from '../../../../settings/settings'
import { EthereumNetwork } from '../../../../plugins/Wallet/database/types'

//#region tracking network
let currentNetwork: EthereumNetwork = EthereumNetwork.Mainnet
currentLocalWalletEthereumNetworkSettings.addListener((v) => (currentNetwork = v))
//#endregion

const pool = new Map<string, HttpProvider>()

export function createProvider(network: EthereumNetwork = currentNetwork) {
    const url = getNetworkSettings(network).middlewareAddress
    const provider = pool.has(url)
        ? pool.get(url)!
        : new Web3.providers.HttpProvider(url, {
              timeout: 5000, // ms
              // @ts-ignore
              clientConfig: {
                  keepalive: true,
                  keepaliveInterval: 1, // ms
              },
              reconnect: {
                  auto: true,
                  delay: 5000, // ms
                  maxAttempts: Number.MAX_SAFE_INTEGER,
                  onTimeout: true,
              },
          })
    if (pool.has(url)) provider.disconnect()
    else pool.set(url, provider)
    return provider
}
