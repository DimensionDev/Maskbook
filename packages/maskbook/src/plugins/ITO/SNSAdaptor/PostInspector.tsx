import { useChainId, useTokenDetailed, EthereumTokenType, FungibleTokenDetailed } from '@masknet/web3-shared'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { isCompactPayload } from './helpers'
import { usePoolPayload } from './hooks/usePoolPayload'
import type { JSON_PayloadInMask } from '../types'
import { ITO, ITO_Error, ITO_Loading } from './ITO'
import { useCallback } from 'react'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { chain_id, pid } = props.payload
    const isCompactPayload_ = isCompactPayload(props.payload)

    const chainId = useChainId()
    const {
        value: payload,
        error,
        loading,
        retry: retryPayload,
    } = usePoolPayload(isCompactPayload_ && chainId === chain_id ? pid : '')

    const _payload = payload ?? props.payload
    // To meet the max allowance of the data size of image steganography, we need to
    //  cut off some properties, such as save the token address string only.
    const token = _payload.token as unknown as string | FungibleTokenDetailed
    const {
        value: tokenDetailed,
        loading: loadingToken,
        retry: retryToken,
    } = useTokenDetailed(
        EthereumTokenType.ERC20,
        typeof token === 'string' ? (token as string) : (token as FungibleTokenDetailed).address,
    )

    const retry = useCallback(() => {
        retryPayload()
        retryToken()
    }, [retryPayload, retryToken])

    const renderITO = () => {
        if (isCompactPayload_) {
            if (loading) return <ITO_Loading />
            if (error) return <ITO_Error retryPoolPayload={retry} />
        }
        if ((loadingToken && typeof token === 'string') || tokenDetailed?.symbol?.toUpperCase() === 'UNKNOWN')
            return <ITO_Loading />
        if (!tokenDetailed && typeof token === 'string') return <ITO_Error retryPoolPayload={retry} />
        return <ITO pid={pid} payload={typeof token === 'string' ? { ..._payload, token: tokenDetailed! } : _payload} />
    }
    return <EthereumChainBoundary chainId={chain_id}>{renderITO()}</EthereumChainBoundary>
}
