import type { ChainId } from '@masknet/web3-shared'
import type Web3 from 'web3'

type EthereumInjectedContext = {
    ethereum:
        | (Web3 & {
              isMetaMask: boolean
              on: (eventName: string, callback: (...args: unknown[]) => void) => void
          })
        | null
}

function registerListenersOnMetaMaskProvider() {
    const ethereum = (globalThis as unknown as EthereumInjectedContext).ethereum
    if (!ethereum?.isMetaMask) return
    console.log('register listeners')
    ethereum.on('accountsChanged', onMetaMaskAccountsChange as (...args: unknown[]) => void)
    ethereum.on('chainChanged', onMetaMaskChainIdChange as (...args: unknown[]) => void)
}

function onMetaMaskAccountsChange(accounts: string) {
    console.log(`Accounts: ${accounts}`)
    window.open('chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/index.html#/', '_blank', 'noopener noreferrer')
}

function onMetaMaskChainIdChange(chainId: ChainId) {
    console.log(`ChainId: ${chainId}`)
    window.open('chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/index.html#/', '_blank', 'noopener noreferrer')
}

registerListenersOnMetaMaskProvider()
