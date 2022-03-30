import { useWeb3Context } from '../context'
import { useAsyncFn } from 'react-use'
import type { ERC20TokenDetailed } from '@masknet/web3-shared-base'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'

export function useAddERC20TokenCallback(): AsyncFnReturn<(token: ERC20TokenDetailed) => Promise<void>> {
    const { addToken } = useWeb3Context()

    return useAsyncFn(
        async (token: ERC20TokenDetailed) => {
            await addToken(token)
        },
        [addToken],
    )
}
