import { useAsyncFn } from 'react-use'
import type { TransactionReceipt } from 'web3-core'
import Web3Utils from 'web3-utils'
import type { ITO } from '@masknet/web3-contracts/types/ITO.js'
import type { ITO2 } from '@masknet/web3-contracts/types/ITO2.js'
import type { Qualification } from '@masknet/web3-contracts/types/Qualification.js'
import type { Qualification2 } from '@masknet/web3-contracts/types/Qualification2.js'
import type { PayableTx } from '@masknet/web3-contracts/types/types.js'
import { type ChainId, SchemaType, TransactionEventType, useITOConstants } from '@masknet/web3-shared-evm'
import {
    isSameAddress,
    isPositive,
    isZero,
    toFixed,
    type FungibleToken,
    currySameAddress,
} from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { fromHex, toHex, type NetworkPluginID } from '@masknet/shared-base'
import type { JSON_PayloadInMask } from '../../types.js'
import { useITO_Contract } from './useITO_Contract.js'
import { useQualificationContract } from './useQualificationContract.js'
import { checkAvailability } from '../utils/checkAvailability.js'

export function useSwapCallback(
    payload: JSON_PayloadInMask,
    total: string,
    token: Partial<FungibleToken<ChainId, SchemaType>>,
    isQualificationHasLucky = false,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const { contract: ITO_Contract, version } = useITO_Contract(chainId, payload.contract_address)
    const { contract: qualificationContract } = useQualificationContract(
        chainId,
        payload.qualification_address,
        payload.contract_address,
    )

    return useAsyncFn(async () => {
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

        // error: not qualified
        try {
            const ifQualified = await (version === 1
                ? (qualificationContract as Qualification).methods.ifQualified(account)
                : (qualificationContract as Qualification2).methods.ifQualified(account, [])
            ).call({
                from: account,
            })
            if (!ifQualified) {
                return
            }
        } catch {
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
                return
            }
        } catch {
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
        const value = toFixed(token.schema === SchemaType.Native ? total : 0)
        const config = {
            from: account,
            gas: isQualificationHasLucky
                ? 200000
                : await (version === 1
                      ? (ITO_Contract as ITO).methods.swap(...swapParamsV1)
                      : (ITO_Contract as ITO2).methods.swap(...swapParamsV2)
                  ).estimateGas({
                      from: account,
                      value,
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
        })
    }, [ITO_Contract, chainId, qualificationContract, account, payload, total, token.address, isQualificationHasLucky])
}
