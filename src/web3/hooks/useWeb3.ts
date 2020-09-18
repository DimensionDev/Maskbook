import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { useMemo } from 'react'

const web3 = new Web3()
web3.eth.transactionConfirmationBlocks = 6

export function useWeb3(provider: Provider) {
    return useMemo(() => {
        web3.setProvider(provider)
        return web3
    }, [provider])
}
