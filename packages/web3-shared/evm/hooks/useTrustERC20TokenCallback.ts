import { useWeb3Context } from '../context'
import { useAsyncFn } from 'react-use'
import type { ERC20TokenDetailed } from '@masknet/web3-shared-base'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'

export function useTrustERC20TokenCallback(): AsyncFnReturn<
    (address: string, token: ERC20TokenDetailed) => Promise<void>
> {
    const { trustToken } = useWeb3Context()

    return useAsyncFn(
        async (address: string, token: ERC20TokenDetailed) => {
            await trustToken(address, token)
        },
        [trustToken],
    )
}
