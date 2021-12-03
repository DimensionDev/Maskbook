import { useEffect } from 'react'
import { first } from 'lodash-unified'
import { useChainId, ChainId, EthereumMethodType, isFortmaticSupported } from '@masknet/web3-shared-evm'
import * as Fortmatic from '@masknet/web3-shared-evm/providers/Fortmatic'
import { EVM_Messages } from '../../messages'

export interface FortmaticProviderBridgeProps {}

export function FortmaticProviderBridge(props: FortmaticProviderBridgeProps) {
    const chainId = useChainId()

    useEffect(() => {
        return EVM_Messages.events.FORTMATIC_PROVIDER_RPC_REQUEST.on(async ({ payload }) => {
            const handleResponse = (error: unknown, result?: any) => {
                if (error) {
                    EVM_Messages.events.FORTMATIC_PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                        payload,
                        error: error instanceof Error ? error : new Error(),
                    })
                    return
                }
                EVM_Messages.events.FORTMATIC_PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    payload,
                    result,
                    error: null,
                })
            }

            const chainIdFinally = (
                payload.method === EthereumMethodType.MASK_LOGIN_FORTMATIC ? first<ChainId>(payload.params) : chainId
            ) as Fortmatic.ChainIdFortmatic
            if (!chainIdFinally || !isFortmaticSupported(chainIdFinally)) throw new Error('Not supported.')

            try {
                switch (payload.method) {
                    case EthereumMethodType.MASK_LOGIN_FORTMATIC:
                        handleResponse(null, {
                            chainId: chainIdFinally,
                            accounts: await Fortmatic.login(chainIdFinally),
                        })
                        break
                    case EthereumMethodType.MASK_LOGOUT_FORTMATIC:
                        handleResponse(null, await Fortmatic.logout(chainIdFinally))
                        break
                    default:
                        const provider = Fortmatic.createProvider(chainIdFinally)
                        handleResponse(null, await provider.send(payload.method, payload.params))
                        break
                }
            } catch (error: unknown) {
                handleResponse(error)
            }
        })
    }, [chainId])

    return null
}
