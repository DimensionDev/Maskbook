// import { useCallback} from "react"
// import type { LosslessV2Pool } from '@masknet/web3-contracts/types/LosslessV2Pool'
// import { usePoolContract } from "../contracts"
// import {BigNumberish} from '@ethersproject/bignumber'

const usePool = (address: string) => {
    // // const { account, chainId } = useActiveWeb3React()
    // // const [poolContract, setPoolContract] = use
    // const poolContract = usePoolContract(address)
    // const deposit = useCallback(
    // 	async (shortPrincipalAmount: BigNumberish, longPrincipalAmount: BigNumberish) => {
    // 		try {
    // 			const tx = await poolContract?.deposit(shortPrincipalAmount, longPrincipalAmount)
    // 			return tx
    // 		} catch (error) {
    // 			console.error("DEPOSIT ERROR", error)
    // 			return error
    // 		}
    // 	},
    // 	[poolContract]
    // )
    // const withdraw = useCallback(
    // 	async (isAtoken: boolean, shortAmount: BigNumberish, longAmount: BigNumberish) => {
    // 		try {
    // 			const tx = await poolContract?.withdraw(isAtoken, shortAmount, longAmount)
    // 			return tx
    // 		} catch (error) {
    // 			console.log(error)
    // 			return error
    // 		}
    // 	},
    // 	[poolContract]
    // )
    // const swap = useCallback(
    // 	async (fromLongToShort: boolean, amount: BigNumberish) => {
    // 		try {
    // 			const tx = await poolContract?.swap(fromLongToShort, amount)
    // 			return tx
    // 		} catch (error) {
    // 			console.error(error)
    // 			return error
    // 		}
    // 	},
    // 	[poolContract]
    // )
    // const sponsorDeposit = useCallback(
    // 	async (principalAmount: BigNumberish) => {
    // 		try {
    // 			const tx = await poolContract?.sponsorDeposit(principalAmount)
    // 			return tx
    // 		} catch (error) {
    // 			console.error(error)
    // 			return error
    // 		}
    // 	},
    // 	[poolContract]
    // )
    // const sponsorWithdraw = useCallback(
    // 	async (principalAmount: BigNumberish) => {
    // 		try {
    // 			const tx = await poolContract?.sponsorWithdraw(principalAmount)
    // 			return tx
    // 		} catch (error) {
    // 			console.error(error)
    // 			return error
    // 		}
    // 	},
    // 	[poolContract]
    // )
    // return { deposit, withdraw, swap, sponsorDeposit, sponsorWithdraw }
}

export default usePool
