import { useCallback } from 'react'
import { usePoolContract } from '../contracts'
import type BN from 'bn.js'
import { useAccount } from '@masknet/web3-shared'

const usePool = (address: string) => {
    // // const { account, chainId } = useActiveWeb3React()
    // // const [poolContract, setPoolContract] = use
    const account = useAccount()
    const poolContract = usePoolContract(address)
    // const config = {
    //     from: account,
    //     value: 0,
    // }
    const deposit = useCallback(
        async (shortPrincipalAmount: string | number | BN, longPrincipalAmount: string | number | BN) => {
            try {
                const tx = poolContract?.methods
                    .deposit(shortPrincipalAmount, longPrincipalAmount)
                    .send({ from: account })
                return tx
            } catch (error) {
                console.error('DEPOSIT ERROR', error)
                return error
            }
        },
        [poolContract],
    )
    const withdraw = useCallback(
        async (isAtoken: boolean, shortAmount: string | number | BN, longAmount: string | number | BN) => {
            try {
                const tx = poolContract?.methods.withdraw(isAtoken, shortAmount, longAmount).send({
                    from: account,
                })
                return tx
            } catch (error) {
                console.log(error)
                return error
            }
        },
        [poolContract],
    )
    const swap = useCallback(
        async (fromLongToShort: boolean, amount: string | number | BN) => {
            try {
                const tx = poolContract?.methods.swap(fromLongToShort, amount)
                return tx
            } catch (error) {
                console.error(error)
                return error
            }
        },
        [poolContract],
    )
    const sponsorDeposit = useCallback(
        async (principalAmount: string | number | BN) => {
            try {
                const tx = poolContract?.methods.sponsorDeposit(principalAmount)
                return tx
            } catch (error) {
                console.error(error)
                return error
            }
        },
        [poolContract],
    )
    const sponsorWithdraw = useCallback(
        async (principalAmount: string | number | BN) => {
            try {
                const tx = poolContract?.methods.sponsorWithdraw(principalAmount)
                return tx
            } catch (error) {
                console.error(error)
                return error
            }
        },
        [poolContract],
    )
    return { deposit, withdraw, swap, sponsorDeposit, sponsorWithdraw }
}

export default usePool
