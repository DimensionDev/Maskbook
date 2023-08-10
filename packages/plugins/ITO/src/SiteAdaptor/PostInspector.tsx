import { useCallback, useMemo } from 'react'
import { type ChainId, isNativeTokenAddress, SchemaType } from '@masknet/web3-shared-evm'
import { isCompactPayload } from './helpers.js'
import { usePoolPayload } from './hooks/usePoolPayload.js'
import type { JSON_PayloadInMask } from '../types.js'
import { ITO, ITO_Error, ITO_Loading } from './ITO.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { type FungibleToken, TokenType } from '@masknet/web3-shared-base'
import { useChainContext, useFungibleToken, useFungibleTokens } from '@masknet/web3-hooks-base'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { chain_id, pid } = props.payload
    const isCompactPayload_ = isCompactPayload(props.payload)

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const {
        value: payload,
        error,
        loading,
        retry: retryPayload,
    } = usePoolPayload(isCompactPayload_ && chainId === chain_id ? pid : '')

    const _payload = payload ?? props.payload
    // To meet the max allowance of the data size of image steganography, we need to
    //  cut off some properties, such as save the token address string only.
    const token = _payload.token as unknown as string | FungibleToken<ChainId, SchemaType>
    const {
        data: tokenDetailed,
        isLoading: _loadingToken,
        refetch: retryToken,
    } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, typeof token === 'string' ? token : token.address, undefined, {
        chainId: _payload.chain_id,
    })

    const exchangeFungibleTokens = useMemo(
        () =>
            _payload.exchange_tokens.map(
                (t) =>
                    ({
                        address: t.address,
                        schema: isNativeTokenAddress(t.address) ? SchemaType.Native : SchemaType.ERC20,
                        chainId: _payload.chain_id,
                        type: TokenType.Fungible,
                    }) as Pick<
                        FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>,
                        'address' | 'type' | 'schema' | 'chainId'
                    >,
            ),
        [JSON.stringify(_payload.exchange_tokens)],
    )

    const {
        value: exchangeTokensDetailed,
        loading: loadingExchangeTokensDetailed,
        retry: retryExchangeTokensDetailed,
    } = useFungibleTokens(NetworkPluginID.PLUGIN_EVM, (exchangeFungibleTokens ?? []).map((t) => t.address) ?? [], {
        chainId: _payload.chain_id,
    })

    const retry = useCallback(() => {
        retryPayload()
        retryToken()
        retryExchangeTokensDetailed()
    }, [retryPayload, retryToken, retryExchangeTokensDetailed])

    const loadingToken = _loadingToken || loadingExchangeTokensDetailed

    if (isCompactPayload_) {
        if (loading) return <ITO_Loading />
        if (error) return <ITO_Error retryPoolPayload={retry} />
    }
    if ((loadingToken && typeof token === 'string') || tokenDetailed?.symbol?.toUpperCase() === 'UNKNOWN')
        return <ITO_Loading />
    if (!tokenDetailed && typeof token === 'string') return <ITO_Error retryPoolPayload={retry} />
    return (
        <ITO
            pid={pid}
            payload={
                typeof token === 'string'
                    ? {
                          ..._payload,
                          token: tokenDetailed as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>,
                          exchange_tokens: exchangeTokensDetailed as Array<
                              FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>
                          >,
                      }
                    : _payload
            }
        />
    )
}
