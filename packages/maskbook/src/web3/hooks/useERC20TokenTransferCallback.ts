import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { useTokenDetailed } from './useTokenDetailed'
import { EthereumTokenType } from '../types'

export function useERC20TokenTransferCallback(address: string, amount?: string, recipient?: string) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const [transferState, setTransferState] = useTransactionState()
    const { value: token } = useTokenDetailed(EthereumTokenType.ERC20, recipient ?? '')

    const transferCallback = useCallback(async () => {
        if (!account || !recipient || !amount || new BigNumber(amount).isZero() || !erc20Contract) {
            setTransferState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // error: invalid recipient address
        if (!EthereumAddress.isValid(recipient)) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid recipient address'),
            })
            return
        }

        // error: insufficent balance
        const balance = await erc20Contract.methods.balanceOf(account).call()

        if (new BigNumber(amount).isGreaterThan(balance)) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Insufficent balance'),
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setTransferState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const estimatedGas = await erc20Contract.methods.transfer(recipient, amount).estimateGas({
            from: account,
            to: erc20Contract.options.address,
        })

        const gas = new BigNumber(estimatedGas).div(1e9).multipliedBy(new BigNumber(10).pow(token?.decimals || 18))
        if (new BigNumber(balance).isLessThan(new BigNumber(amount).plus(gas))) {
            amount = new BigNumber(balance).minus(gas).toFixed()
        }

        // step 2: blocking
        return new Promise<string>(async (resolve, reject) => {
            erc20Contract.methods.transfer(recipient, amount ?? 0).send(
                {
                    from: account,
                    to: erc20Contract.options.address,
                    gas: estimatedGas,
                },
                (error, hash) => {
                    if (error) {
                        setTransferState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    } else {
                        setTransferState({
                            type: TransactionStateType.HASH,
                            hash,
                        })
                        resolve(hash)
                    }
                },
            )
        })
    }, [account, address, amount, recipient, erc20Contract])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
