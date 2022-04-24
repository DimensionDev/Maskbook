import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { unreachable } from '@dimensiondev/kit'
import { ERC20TokenDetailed, EthereumTokenDetailedType, SchemaType } from '../types'
import { useERC20TokenDetailed } from './useERC20TokenDetailed'
import { useNativeTokenDetailed } from './useNativeTokenDetailed'

export function useFungibleTokenDetailed<P extends EthereumTokenDetailedType<SchemaType.ERC20 | SchemaType.Native>>(
    type: SchemaType.ERC20 | SchemaType.Native,
    address: string,
    token?: Partial<P>,
): AsyncStateRetry<P | undefined> {
    const r1 = useNativeTokenDetailed()
    const r2 = useERC20TokenDetailed(type === SchemaType.ERC20 ? address : '', token as unknown as ERC20TokenDetailed)
    switch (type) {
        case SchemaType.Native:
            return r1 as AsyncStateRetry<P | undefined>
        case SchemaType.ERC20:
            return r2 as AsyncStateRetry<P | undefined>
        default:
            unreachable(type)
    }
}
