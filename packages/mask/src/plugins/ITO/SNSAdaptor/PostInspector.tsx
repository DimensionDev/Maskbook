import { useCallback, useMemo } from 'react'
import { ChainId, SchemaType, useTokenConstants } from '@masknet/web3-shared-evm'
import { isCompactPayload } from './helpers'
import { usePoolPayload } from './hooks/usePoolPayload'
import type { JSON_PayloadInMask } from '../types'
import { ITO, ITO_Error, ITO_Loading } from './ITO'
import { NetworkPluginID, isSameAddress, FungibleToken } from '@masknet/web3-shared-base'
import { ThemeProvider } from '@mui/material'
import { useChainId, useFungibleToken } from '@masknet/plugin-infra/web3'
import { useClassicMaskSNSPluginTheme } from '../../../utils'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { chain_id, pid } = props.payload
    const isCompactPayload_ = isCompactPayload(props.payload)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
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
        value: tokenDetailed,
        loading: _loadingToken,
        retry: retryToken,
    } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        typeof token === 'string' ? (token as string) : (token as FungibleToken<ChainId, SchemaType>).address,
    )

    const exchangeFungibleTokens = useMemo(
        () =>
            _payload.exchange_tokens.map(
                (t) =>
                    ({
                        address: t.address,
                        type: isSameAddress(t.address, NATIVE_TOKEN_ADDRESS) ? SchemaType.Native : SchemaType.ERC20,
                        chainId: _payload.chain_id,
                    } as Pick<FungibleTokenInitial, 'address' | 'type'>),
            ),
        [JSON.stringify(_payload.exchange_tokens)],
    )

    const {
        value: exchangeTokensDetailed,
        loading: loadingExchangeTokensDetailed,
        retry: retryExchangeTokensDetailed,
    } = useFungibleTokensDetailed(exchangeFungibleTokens, _payload.chain_id)

    const retry = useCallback(() => {
        retryPayload()
        retryToken()
        retryExchangeTokensDetailed()
    }, [retryPayload, retryToken, retryExchangeTokensDetailed])

    const loadingToken = _loadingToken || loadingExchangeTokensDetailed

    const renderITO = () => {
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
                        ? { ..._payload, token: tokenDetailed!, exchange_tokens: exchangeTokensDetailed! }
                        : _payload
                }
            />
        )
    }

    const theme = useClassicMaskSNSPluginTheme()

    return <ThemeProvider theme={theme}>{renderITO()}</ThemeProvider>
}
