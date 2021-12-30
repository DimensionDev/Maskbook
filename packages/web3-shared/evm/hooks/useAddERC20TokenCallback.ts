import { useWeb3Context } from '../context'
import { useAsyncFn } from 'react-use'
import type { ERC20TokenDetailed } from '../types'

export function useAddERC20TokenCallback() {
    const { addToken } = useWeb3Context()

    return useAsyncFn(
        async (token: ERC20TokenDetailed) => {
            await addToken(token)
        },
        [addToken],
    )
}
