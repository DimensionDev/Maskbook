import type { AbiItem } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import {
    type ChainId,
    type Web3,
    createContract,
    TransactionEventType,
    ZERO_ADDRESS,
    getLidoConstant,
    splitSignature,
} from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
import type { Lido } from '@masknet/web3-contracts/types/Lido.js'
import type { LidoWithdraw } from '@masknet/web3-contracts/types/LidoWithdraw.js'
import type { LidoStETH } from '@masknet/web3-contracts/types/LidoStETH.js'

import { EVMWeb3, Lido as LidoAPI } from '@masknet/web3-providers'
import LidoABI from '@masknet/web3-contracts/abis/Lido.json' with { type: 'json' }
import LidoWithdrawABI from '@masknet/web3-contracts/abis/LidoWithdraw.json' with { type: 'json' }
import LidoStEthABI from '@masknet/web3-contracts/abis/LidoStETH.json' with { type: 'json' }
import { ProtocolType, type SavingsProtocol, type TokenPair } from '../types.js'

const MAX_DEADLINE = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
export class LidoProtocol implements SavingsProtocol {
    readonly type = ProtocolType.Lido

    constructor(readonly pair: TokenPair) {}

    get bareToken() {
        return this.pair[0]
    }

    get stakeToken() {
        return this.pair[1]
    }

    async getApr(chainId: ChainId, web3: Web3) {
        try {
            return await LidoAPI.getStEthAPR()
        } catch {
            // the default APR is 5.30%
            return '5.30'
        }
    }
    async getBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const contract = createContract<Lido>(
                web3,
                getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'),
                LidoABI as AbiItem[],
            )
            return new BigNumber((await contract?.methods.balanceOf(account).call()) ?? 0)
        } catch {}
        return ZERO
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const contract = createContract<Lido>(
                web3,
                getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'),
                LidoABI as AbiItem[],
            )
            const gasEstimate = await contract?.methods
                .submit(getLidoConstant(chainId, 'LIDO_REFERRAL_ADDRESS') || ZERO_ADDRESS)
                .estimateGas({
                    from: account,
                    // it's a BigNumber so it's ok
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    value: value.toString(),
                })

            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('LDO `depositEstimate()` Error', error)
            return new BigNumber(0)
        }
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const gasEstimate = await this.depositEstimate(account, chainId, web3, value)
        return new Promise<string>((resolve, reject) => {
            const contract = createContract<Lido>(
                web3,
                getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'),
                LidoABI as AbiItem[],
            )
            contract?.methods
                .submit(getLidoConstant(chainId, 'LIDO_REFERRAL_ADDRESS') || ZERO_ADDRESS)
                .send({
                    from: account,
                    // it's a BigNumber so it's ok
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    value: value.toString(),
                    gas: gasEstimate.toNumber(),
                })
                .once(TransactionEventType.ERROR, reject)
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
        })
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        return ZERO
    }

    public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const lidoStETHContract = createContract<LidoStETH>(
            web3,
            getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'),
            LidoStEthABI as AbiItem[],
        )

        const nonces = await lidoStETHContract?.methods.nonces(account).call()

        const signature = await EVMWeb3.signMessage(
            'typedData',
            JSON.stringify({
                types: {
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                    Permit: [
                        {
                            name: 'owner',
                            type: 'address',
                        },
                        {
                            name: 'spender',
                            type: 'address',
                        },
                        {
                            name: 'value',
                            type: 'uint256',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                        {
                            name: 'deadline',
                            type: 'uint256',
                        },
                    ],
                },
                primaryType: 'Permit',
                domain: {
                    name: 'Liquid staked Ether 2.0',
                    version: '2',
                    chainId,
                    verifyingContract: getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'),
                },
                message: {
                    owner: account,
                    spender: getLidoConstant(chainId, 'LIDO_WITHDRAW_ADDRESS'),
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    value: value.toString(),
                    nonce: nonces,
                    deadline: MAX_DEADLINE.toString(),
                },
            }),
        )

        const { v, r, s } = splitSignature(signature)

        const contract = createContract<LidoWithdraw>(
            web3,
            getLidoConstant(chainId, 'LIDO_WITHDRAW_ADDRESS'),
            LidoWithdrawABI as AbiItem[],
        )

        const result = contract?.methods.requestWithdrawalsWithPermit([value], account, [
            value,
            MAX_DEADLINE.toString(),
            v,
            r,
            s,
        ])

        const gas = await result?.estimateGas({ from: account })
        return new Promise<string>((resolve, reject) => {
            result
                ?.send({
                    from: account,
                    gas,
                })
                .once(TransactionEventType.ERROR, reject)
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
        })
    }
}
