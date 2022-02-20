// export function useLockCallback(address: string, amount: string) {
//     const poolContract = usePoolTogetherPoolContract(address)

import { useAccount, useChainId, useTransactionState, useWeb3 } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { useLockProxyContract } from '../contracts/useLockProxy'

//     const account = useAccount()
//     const [depositState, setDepositState] = useTransactionState()

//     const depositCallback = useCallback(async () => {
//         if (!token || !poolContract) {
//             setDepositState({
//                 type: TransactionStateType.UNKNOWN,
//             })
//             return
//         }

//         // pre-step: start waiting for provider to confirm tx
//         setDepositState({
//             type: TransactionStateType.WAIT_FOR_CONFIRMING,
//         })

//         // step 1: estimate gas
//         const config = {
//             from: account,
//             value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
//         }
//         const estimatedGas = await poolContract.methods
//             .depositTo(account, amount, controlledToken, referrer)
//             .estimateGas(config)
//             .catch((error) => {
//                 setDepositState({
//                     type: TransactionStateType.FAILED,
//                     error,
//                 })
//                 throw error
//             })

//         // step 2: blocking
//         return new Promise<string>((resolve, reject) => {
//             poolContract.methods
//                 .depositTo(account, amount, controlledToken, referrer)
//                 .send({
//                     ...config,
//                     gas: estimatedGas,
//                 })
//                 .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
//                     setDepositState({
//                         type: TransactionStateType.HASH,
//                         hash,
//                     })
//                     resolve(hash)
//                 })
//                 .on(TransactionEventType.ERROR, (error) => {
//                     setDepositState({
//                         type: TransactionStateType.FAILED,
//                         error,
//                     })
//                     reject(error)
//                 })
//         })
//     }, [address, account, amount, token, referrer, controlledToken])

//     const resetCallback = useCallback(() => {
//         setDepositState({
//             type: TransactionStateType.UNKNOWN,
//         })
//     }, [])

//     return [depositState, depositCallback, resetCallback] as const
// }
export function useLockCallback() {
    const [lockState, setLockState] = useTransactionState()
    const lockProxyContract = useLockProxyContract('0xeC4E1A014fAf0D966332E62970CD7c6553671d76')
    const account = useAccount()
    const chainId = useChainId()
    const web3 = useWeb3(chainId ? { chainId } : {})

    // const getImplementationContractAddress = useCallback(async () => {
    //     await lockProxyContract?.methods.implementation().call()
    // }, [lockProxyContract])

    return useAsync(async () => {
        // if (!lockProxyContract) return null
        return lockProxyContract?.methods.lock(
            '0xaE7364C49FEb600501ADeeaA1D6C033a3a01c455',
            51.936,
            1647982800,
            account,
        )

        // return web3.eth.getStorageAt(
        //     '0x4e908F706f8935f10C101Ea3D7B2DEfc78df284e',
        //     '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
        // )
    }, [])
    // const lockCallback = useCallback(async () => {
    //     if (lockProxyContract) {
    //         setLockState({
    //             type: TransactionStateType.UNKNOWN,
    //         })
    //     }

    //     setLockState({
    //         type: TransactionStateType.WAIT_FOR_CONFIRMING,
    //     })

    //     // step 1: estimate gas
    //     // const config = {
    //     //     from: account,
    //     //     value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
    //     // }

    //     return
    // }, [])

    // return [lockState, lockCallback, setLockState] as const
}
