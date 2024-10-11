import { BigNumber } from 'bignumber.js'
import { identity, pickBy, memoize } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { ZERO_ADDRESS } from '../constants/index.js'
import { isEmptyHex } from '../helpers/address.js'
import { ChainId, type Transaction } from '../types/index.js'

const normalizeHex = memoize((value: string | number) => {
    // fix an abnormal hex value like: 0x02c68af0bb140000
    if (typeof value === 'string' && value.length > 3 && value.startsWith('0x0'))
        return web3_utils.toHex(new BigNumber(value).toFixed())
    return web3_utils.toHex(value)
})

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
        const {
            chainId,
            from,
            to,
            value,
            gas,
            gasPrice,
            maxPriorityFeePerGas,
            maxFeePerGas,
            data,
            nonce,
            _disableExceptionSnackbar,
            _disableSuccessSnackbar,
            _disableSnackbar,
        } = {
            ...this.transaction,
            ...pickBy(overrides, identity),
        }
        return pickBy(
            {
                from,
                to,
                data,
                value: value ? normalizeHex(value) : undefined,
                chainId: chainId && chainId !== ChainId.Astar ? normalizeHex(chainId) : undefined,
                gas: gas ? normalizeHex(gas) : undefined,
                gasPrice: gasPrice ? normalizeHex(gasPrice) : undefined,
                maxPriorityFeePerGas: maxPriorityFeePerGas ? normalizeHex(maxPriorityFeePerGas) : undefined,
                maxFeePerGas: maxFeePerGas ? normalizeHex(maxFeePerGas) : undefined,
                nonce,
                _disableExceptionSnackbar,
                _disableSuccessSnackbar,
                _disableSnackbar,
            },
            identity,
        )
    }
}
