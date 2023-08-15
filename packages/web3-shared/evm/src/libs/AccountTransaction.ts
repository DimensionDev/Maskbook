import { identity, pickBy } from 'lodash-es'
import { toHex } from 'web3-utils'
import { ZERO_ADDRESS } from '../constants/index.js'
import { isEmptyHex } from '../helpers/address.js'
import { ChainId, type Transaction } from '../types/index.js'

export class AccountTransaction {
    constructor(private transaction?: Transaction) {}

    get from() {
        return this.transaction?.from ?? ''
    }

    get to() {
        const to = this.transaction?.to
        if (!to) return ZERO_ADDRESS
        if (isEmptyHex(to)) return ZERO_ADDRESS
        return to
    }

    get value() {
        return this.transaction?.value ?? '0x0'
    }

    get data() {
        const data = this.transaction?.data
        if (isEmptyHex(data)) return
        if (!data.startsWith('0x')) return `0x${data}`
        return data
    }

    get functionSignature() {
        return this.data?.slice(0, 10)
    }

    get functionParameters() {
        return this.data?.slice(10)
    }

    fill(overrides?: Transaction): Transaction {
        const { chainId, from, to, value, gas, gasPrice, maxPriorityFeePerGas, maxFeePerGas, data, nonce } = {
            ...this.transaction,
            ...pickBy(overrides, identity),
        }
        return pickBy(
            {
                from,
                to,
                data,
                value: value ? toHex(value) : undefined,
                chainId: chainId && chainId !== ChainId.Astar ? toHex(chainId) : undefined,
                gas: gas ? toHex(gas) : undefined,
                gasPrice: gasPrice ? toHex(gasPrice) : undefined,
                maxPriorityFeePerGas: maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : undefined,
                maxFeePerGas: maxFeePerGas ? toHex(maxFeePerGas) : undefined,
                nonce,
            },
            identity,
        )
    }
}
