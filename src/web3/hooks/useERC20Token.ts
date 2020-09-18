import { useAsync } from 'react-use'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from './useContract'

function resolveSettleResult<T>(result: PromiseSettledResult<T>, fallback: T) {
    return result.status === 'fulfilled' ? result.value : fallback
}

export function useERC20Token(address: string) {
    const account = useAccount()
    const contract = useERC20TokenContract(address)

    return useAsync(async () => {
        console.log(contract)

        if (!contract) return null

        console.log(contract.methods.name())

        const [name, symbol, decimals, balanceOf] = await Promise.allSettled([
            contract.methods.name().call(),
            contract.methods.symbol().call(),
            contract.methods.decimals().call(),
            contract.methods.balanceOf(account).call(),
        ])

        console.log({
            name,
            symbol,
            decimals,
            balanceOf,
        })

        return {
            address,
            name: resolveSettleResult(name, ''),
            symbol: resolveSettleResult(symbol, ''),
            decimals: Number.parseInt(resolveSettleResult(decimals, '0')),
            balanceOf: resolveSettleResult(balanceOf, '0'),
        }
    }, [address, account, contract])
}
