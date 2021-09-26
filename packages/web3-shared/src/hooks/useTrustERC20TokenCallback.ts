import { useWeb3Context } from '../context'
import { useAsyncFn } from 'react-use'
import type { ERC20TokenDetailed } from '..'

export function useTrustERC20TokenCallback() {
    const { trustERC20Token } = useWeb3Context()

    return useAsyncFn(async (address: string, token: ERC20TokenDetailed) => {
        await trustERC20Token(address, token)
    }, [])
}
