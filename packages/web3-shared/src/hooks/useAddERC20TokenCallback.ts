import { useWeb3Context } from '../context'
import { useAsyncFn } from 'react-use'
import type { ERC20TokenDetailed } from '..'

export function useAddERC20TokenCallback() {
    const { addERC20Token } = useWeb3Context()

    return useAsyncFn(async (token: ERC20TokenDetailed) => {
        await addERC20Token(token)
    }, [])
}
