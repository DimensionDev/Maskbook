import { BigNumber } from 'bignumber.js'
import { type ChainId, ZERO_ADDRESS, getLidoConstant, splitSignature } from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
import { LidoAbi } from '@masknet/web3-contracts/types/Lido.js'
import { LidoWithdrawAbi } from '@masknet/web3-contracts/types/LidoWithdraw.js'
import { LidoStETHAbi } from '@masknet/web3-contracts/types/LidoStETH.js'

import { EVMContract, EVMWeb3, Lido as LidoAPI } from '@masknet/web3-providers'
import type { Address, ContractFunctionArgs, Hex } from 'viem'
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

    async getApr(chainId: ChainId) {
        try {
            return await LidoAPI.getStEthAPR()
        } catch {
            // the default APR is 5.30%
            return '5.30'
        }
    }
    async getBalance(chainId: ChainId, account: string) {
        try {
            const contract = EVMContract.getContract(getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'), LidoAbi)
            return new BigNumber(
                (
                    await EVMContract.readContract(contract, 'balanceOf', [account as Address], { chainId })
                )?.toString() ?? 0,
            )
        } catch {}
        return ZERO
    }

    public async depositEstimate(account: string, chainId: ChainId, value: BigNumber.Value) {
        try {
            const contract = EVMContract.getContract(getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'), LidoAbi)
            const gasEstimate = await EVMContract.estimateContractGas(
                contract,
                'submit',
                [(getLidoConstant(chainId, 'LIDO_REFERRAL_ADDRESS') || ZERO_ADDRESS) as Address],
                {
                    chainId,
                    from: account,
                    // it's a BigNumber so it's ok
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    value: value.toString(),
                },
            )

            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('LDO `depositEstimate()` Error', error)
            return new BigNumber(0)
        }
    }

    public async deposit(account: string, chainId: ChainId, value: BigNumber.Value) {
        const gasEstimate = new BigNumber(await this.depositEstimate(account, chainId, value))
        const contract = EVMContract.getContract(getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'), LidoAbi)
        const tx = EVMContract.createTransactionRequest(
            contract,
            'submit',
            [(getLidoConstant(chainId, 'LIDO_REFERRAL_ADDRESS') || ZERO_ADDRESS) as Address],
            {
                from: account,
                // it's a BigNumber so it's ok
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                value: value.toString(),
                gas: gasEstimate.toFixed(),
                chainId,
            },
        )
        if (!tx) throw new Error("Can't create deposit transaction")
        const hash = await EVMWeb3.sendTransaction(tx, { chainId })
        await EVMWeb3.confirmTransaction(hash, { chainId })
        return hash
    }

    public async withdrawEstimate(account: string, chainId: ChainId, value: BigNumber.Value) {
        return ZERO
    }

    public async withdraw(account: string, chainId: ChainId, value: BigNumber.Value) {
        const lidoStETHContract = EVMContract.getContract(getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'), LidoStETHAbi)

        const nonce = await EVMContract.readContract(lidoStETHContract, 'nonces', [account as Address], { chainId })
        const amount = BigInt(new BigNumber(value).toFixed(0))

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
                    nonce: nonce?.toString() ?? '0',
                    deadline: MAX_DEADLINE.toString(),
                },
            }),
        )

        const { v, r, s } = splitSignature(signature)

        const contract = EVMContract.getContract(getLidoConstant(chainId, 'LIDO_WITHDRAW_ADDRESS'), LidoWithdrawAbi)

        const args: ContractFunctionArgs<
            typeof LidoWithdrawAbi,
            'nonpayable' | 'payable',
            'requestWithdrawalsWithPermit'
        > = [
            [amount],
            account as Address,
            {
                value: amount,
                deadline: MAX_DEADLINE,
                v,
                r: r as Hex,
                s: s as Hex,
            },
        ]

        const gas = await EVMContract.estimateContractGas(contract, 'requestWithdrawalsWithPermit', args, {
            chainId,
            from: account,
        })
        const tx = EVMContract.createTransactionRequest(contract, 'requestWithdrawalsWithPermit', args, {
            from: account,
            gas,
            chainId,
        })
        if (!tx) throw new Error("Can't create withdraw transaction")
        const hash = await EVMWeb3.sendTransaction(tx, { chainId })
        await EVMWeb3.confirmTransaction(hash, { chainId })
        return hash
    }
}
