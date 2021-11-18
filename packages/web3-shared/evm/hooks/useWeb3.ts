import Web3 from 'web3'
import { useMemo } from 'react'
import { first } from 'lodash-es'
import { useChainId, useWeb3Provider } from '.'
import { useRPCConstants, ChainId } from '..'

function useWeb3Instance() {
    const provider = useWeb3Provider()
    return useMemo(() => new Web3(provider), [provider])
}

export function useWeb3(readonly = false, chainId?: ChainId) {
    const web3 = useWeb3Instance()
    const currentChainId = useChainId()
    const { RPC } = useRPCConstants(chainId ?? currentChainId)

    return useMemo(() => {
        const providerURL = first(RPC)
        if (providerURL && readonly) web3.setProvider(providerURL)
        return web3
    }, [web3, RPC, readonly])
}
