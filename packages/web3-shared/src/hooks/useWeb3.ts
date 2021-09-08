import Web3 from 'web3'
import { useMemo } from 'react'
import { first } from 'lodash-es'
import { useSubscription } from 'use-subscription'
import { useWeb3Context } from '../context'
import { useChainId } from '.'
import { useRPCConstants } from '..'

function useWeb3Instance() {
    const _ = useWeb3Context()
    const provider = useSubscription(_.provider)
    return useMemo(() => new Web3(provider), [provider])
}

export function useWeb3(readonly = false) {
    const web3 = useWeb3Instance()
    const chainId = useChainId()
    const { RPC } = useRPCConstants(chainId)

    return useMemo(() => {
        const providerURL = first(RPC)
        if (providerURL && readonly) web3.setProvider(providerURL)
        return web3
    }, [web3, RPC, readonly])
}
