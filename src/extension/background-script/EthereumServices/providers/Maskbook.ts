import Web3 from 'web3'
import type { HttpProvider } from 'web3-core'
import { getConstant } from '../../../../web3/constants'
import { currentMaskbookChainIdSettings } from '../../../../settings/settings'
import { ChainId } from '../../../../web3/types'

//#region tracking chain id
let currentChainId: ChainId = ChainId.Mainnet
currentMaskbookChainIdSettings.addListener((v) => (currentChainId = v))
//#endregion

const pool = new Map<string, HttpProvider>()

export function createProvider(chainId = currentChainId) {
    const url = getConstant('INFURA_ADDRESS', chainId)
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
