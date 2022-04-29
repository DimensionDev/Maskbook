import { fromHex, toHex } from '@masknet/shared-base'
import type { ITO } from '@masknet/web3-contracts/types/ITO'
import type { ITO2 } from '@masknet/web3-contracts/types/ITO2'
import type { Qualification } from '@masknet/web3-contracts/types/Qualification'
import type { Qualification2 } from '@masknet/web3-contracts/types/Qualification2'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import { isPositive, isZero, toFixed } from '@masknet/web3-shared-base'
import {
    currySameAddress,
    EthereumTokenType,
    FungibleTokenDetailed,
    isSameAddress,
    TransactionEventType,
    useAccount,
    useChainId,
    useITOConstants,
} from '@masknet/web3-shared-evm'
import { useCallback, useState } from 'react'
import type { TransactionReceipt } from 'web3-core'
import Web3Utils from 'web3-utils'
import type { JSON_PayloadInMask } from '../../types'
import { checkAvailability } from '../../Worker/apis/checkAvailability'
import { useITO_Contract } from './useITO_Contract'
import { useQualificationContract } from './useQualificationContract'

export function useSwapCallback(
    payload: JSON_PayloadInMask,
    total: string,
    token: Partial<FungibleTokenDetailed>,
    isQualificationHasLucky = false,
) {
    const account = useAccount()
    const chainId = useChainId()
    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const { contract: ITO_Contract, version } = useITO_Contract(payload.contract_address)
    const [loading, setLoading] = useState(false)
    const { contract: qualificationContract } = useQualificationContract(
        payload.qualification_address,
        payload.contract_address,
    )

    const swapCallback = useCallback(async () => {
        if (!ITO_Contract || !qualificationContract || !payload) return

        const { pid, password } = payload

        if (!password) return

        // error: poll has expired
        if (payload.end_time < Date.now()) return

        // error: invalid swap amount
        if (!isPositive(total)) return

        // error: invalid token
        const swapTokenAt = payload.exchange_tokens.findIndex(currySameAddress(token.address))
        if (swapTokenAt === -1) return

        setLoading(true)
        // error: not qualified
        try {
            const ifQualified = await (version === 1
                ? (qualificationContract as Qualification).methods.ifQualified(account)
                : (qualificationContract as Qualification2).methods.ifQualified(account, [])
            ).call({
                from: account,
            })
            if (!ifQualified) {
                setLoading(false)
                return
            }
        } catch {
            setLoading(false)
            return
        }

        // check remaining
        try {
            const availability = await checkAvailability(
                pid,
                account,
                payload.contract_address,
                chainId,
                isSameAddress(payload.contract_address, ITO_CONTRACT_ADDRESS),
            )
            if (isZero(availability.remaining)) {
                setLoading(false)
                return
            }
        } catch {
            setLoading(false)
            return
        }

        const swapParamsV1 = [
            pid,
            Web3Utils.soliditySha3(
                Web3Utils.hexToNumber(`0x${toHex(fromHex(Web3Utils.sha3(password) ?? '').slice(0, 5))}`),
                account,
            )!,
            Web3Utils.sha3(account)!,
            swapTokenAt,
            total,
        ] as Parameters<ITO['methods']['swap']>

        const swapParamsV2 = [
            pid,
            Web3Utils.soliditySha3(
                Web3Utils.hexToNumber(`0x${toHex(fromHex(Web3Utils.sha3(password) ?? '').slice(0, 5))}`),
                account,
            )!,
            swapTokenAt,
            total,
            [],
        ] as Parameters<ITO2['methods']['swap']>

        // estimate gas and compose transaction
        const value = toFixed(token.type === EthereumTokenType.Native ? total : 0)
        const config = {
            from: account,
            gas: isQualificationHasLucky
                ? 200000
                : await (version === 1
                      ? (ITO_Contract as ITO).methods.swap(...swapParamsV1)
                      : (ITO_Contract as ITO2).methods.swap(...swapParamsV2)
                  )
                      .estimateGas({
                          from: account,
                          value,
                      })
                      .catch((error) => {
                          setLoading(false)
                          throw error
                      }),
            value,
        }

        // send transaction and wait for hash
        return new Promise<TransactionReceipt>((resolve, reject) => {
            const onSucceed = (_: number, receipt: TransactionReceipt) => {
                resolve(receipt)
            }
            const onFailed = (error: Error) => {
                reject(error)
            }
            ;(version === 1
                ? (ITO_Contract as ITO).methods.swap(...swapParamsV1)
                : (ITO_Contract as ITO2).methods.swap(...swapParamsV2)
            )
                .send(config as PayableTx)
                .on(TransactionEventType.CONFIRMATION, onSucceed)
                .on(TransactionEventType.ERROR, onFailed)
        }).finally(() => setLoading(false))
    }, [ITO_Contract, chainId, qualificationContract, account, payload, total, token.address, isQualificationHasLucky])

    return [loading, swapCallback] as const
}
