import { isGreaterThan, isSameAddress, isZero } from '@masknet/web3-shared-base'
import { isEIP7702Delegation, isEmptyHex, isNativeTokenAddress, isValidAddress } from '@masknet/web3-shared-evm'

interface OKXTransaction {
    data: string
    from: string
    to: string
    value: string
}

interface ValidationOptions {
    account: string
    fromTokenAddress: string
    inputAmount?: string
    requireZeroValueForERC20?: boolean
}

export function assertOKXTransaction(transaction: OKXTransaction, options: ValidationOptions) {
    if (!isValidAddress(transaction.from) || !isValidAddress(transaction.to)) {
        throw new Error('The transaction contains an invalid address.')
    }
    if (!isSameAddress(transaction.from, options.account)) throw new Error('The transaction sender does not match.')
    if (!/^0x[\da-f]{8,}$/iu.test(transaction.data)) throw new Error('The transaction data is invalid.')
    if (isSameAddress(transaction.to, options.fromTokenAddress)) throw new Error('The transaction target is invalid.')

    if (options.requireZeroValueForERC20 && !isNativeTokenAddress(options.fromTokenAddress)) {
        if (!isZero(transaction.value)) throw new Error('An ERC-20 swap must not transfer native tokens.')
        return
    }

    if (
        options.inputAmount &&
        isNativeTokenAddress(options.fromTokenAddress) &&
        isGreaterThan(transaction.value, options.inputAmount)
    ) {
        throw new Error('The transaction transfers more native tokens than requested.')
    }
}

export function assertOKXContractTarget(code: string) {
    if (isEmptyHex(code) || isEIP7702Delegation(code)) throw new Error('The transaction target is not a contract.')
}
