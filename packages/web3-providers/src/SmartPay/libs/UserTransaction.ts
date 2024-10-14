import { BigNumber } from 'bignumber.js'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { AbiItem } from 'web3-utils'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { isGreaterThan, multipliedBy, toFixed } from '@masknet/web3-shared-base'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json' with { type: 'json' }
import EntryPointABI from '@masknet/web3-contracts/abis/EntryPoint.json' with { type: 'json' }
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import type { EntryPoint } from '@masknet/web3-contracts/types/EntryPoint.js'
import {
    createContract,
    formatEthereumAddress,
    getSmartPayConstants,
    getZeroAddress,
    isEmptyHex,
    isNativeTokenAddress,
    isValidAddress,
    isZeroAddress,
    isZeroString,
    type ChainId,
    type Signer,
    type Transaction,
    type UserOperation,
    type Web3,
    abiCoder,
} from '@masknet/web3-shared-evm'

const USER_OP_TYPE = {
    userOp: {
        sender: 'address',
        nonce: 'uint256',
        initCode: 'bytes',
        callData: 'bytes',
        callGas: 'uint256',
        verificationGas: 'uint256',
        preVerificationGas: 'uint256',
        maxFeePerGas: 'uint256',
        maxPriorityFeePerGas: 'uint256',
        paymaster: 'address',
        paymasterData: 'bytes',
        signature: 'bytes',
    },
}

const POSTOP = 35000

const DEFAULT_USER_OPERATION: Required<UserOperation> = {
    sender: getZeroAddress(),
    nonce: 0,
    initCode: '0x',
    callData: '0x',
    callGas: '35000',
    // default verification gas. will add create2 cost (3200 + 200 * length) if initCode exists
    verificationGas: '100000',
    // should also cover calldata cost.
    preVerificationGas: '21000',
    maxFeePerGas: '0',
    maxPriorityFeePerGas: '1000000000',
    paymaster: getZeroAddress(),
    paymasterData: '0x',
    signature: '0x',
}

const CALL_WALLET_TYPE: AbiItem = {
    name: 'execFromEntryPoint',
    type: 'function',
    inputs: [
        {
            internalType: 'address',
            name: 'dest',
            type: 'address',
        },
        {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
        },
        {
            internalType: 'bytes',
            name: 'func',
            type: 'bytes',
        },
    ],
}

interface Options {
    paymentToken?: string
}

/**
 * The wrapped UserOperation helper.
 * Learn more: https://github.com/eth-infinitism/account-abstraction/blob/develop/test/UserOp.ts
 */
export class UserTransaction {
    /**
     * Use UserTransaction.fromTransaction() or UserTransaction.fromUserOperation() stead.
     * They ensure to create of a valid user operation.
     *
     * @param chainId
     * @param entryPoint
     * @param userOperation
     */
    private constructor(
        private chainId: ChainId,
        private entryPoint: string,
        private userOperation: UserOperation,
        private options?: Options,
    ) {}

    get paymentToken() {
        return this.options?.paymentToken
    }

    get initCode() {
        return this.userOperation.initCode
    }

    get nonce() {
        return this.userOperation.nonce ?? 0
    }

    get hasPaymaster() {
        return !!(this.userOperation.paymaster && !isZeroAddress(this.userOperation.paymaster))
    }

    /**
     * Pack everything without signature
     */
    get pack() {
        const encoded = abiCoder.encodeParameter(USER_OP_TYPE, {
            ...this.userOperation,
            signature: '0x',
        })
        return `0x${encoded.slice(66, encoded.length - 64)}`
    }

    /**
     * Pack everything include signature
     */
    get packAll() {
        const encoded = abiCoder.encodeParameter(USER_OP_TYPE, this.userOperation)
        return `0x${encoded.slice(66, encoded.length - 64)}`
    }

    get hash() {
        return web3_utils.keccak256(this.pack)
    }

    get requestId() {
        return web3_utils.keccak256(
            abiCoder.encodeParameters(['bytes32', 'address', 'uint256'], [this.hash, this.entryPoint, this.chainId]),
        )
    }

    get operation() {
        return this.userOperation
    }

    createWalletContract(web3: Web3, sender: string) {
        const contract = createContract<Wallet>(web3, sender, WalletABI as AbiItem[])
        if (!contract) throw new Error('Failed to create wallet contract.')
        return contract
    }

    createEntryPointContract(web3: Web3) {
        const contract = createContract<EntryPoint>(web3, this.entryPoint, EntryPointABI as AbiItem[])
        if (!contract) throw new Error('Failed to create entry point contract.')
        return contract
    }

    async fillUserOperation(web3: Web3, overrides?: Required<Pick<UserOperation, 'initCode' | 'nonce'>>) {
        // from overrides
        if (overrides) {
            this.userOperation.nonce = overrides.nonce
            this.userOperation.initCode = overrides.initCode
        }

        const { initCode, nonce, sender, callData, callGas, preVerificationGas, maxFeePerGas, maxPriorityFeePerGas } =
            this.userOperation

        // add sender
        if (!isEmptyHex(initCode) && !isValidAddress(sender)) {
            this.userOperation.sender = await this.createEntryPointContract(web3)
                .methods.getSenderAddress(initCode, nonce)
                .call()
        }

        // fill nonce
        if (isValidAddress(this.userOperation.sender) && typeof overrides === 'undefined' && nonce === 0) {
            try {
                const nonce_ = await this.createWalletContract(web3, sender).methods.nonce().call()
                this.userOperation.nonce = web3_utils.toNumber(nonce_) as number
            } catch (error) {
                this.userOperation.nonce = 0
            }
        }

        if (!isEmptyHex(callData)) {
            const estimatedGas = await web3.eth.estimateGas({
                from: this.entryPoint,
                to: this.userOperation.sender,
                data: callData,
            })
            this.userOperation.callGas = web3_utils.toHex(estimatedGas)
        } else {
            this.userOperation.callGas = callGas ?? DEFAULT_USER_OPERATION.callGas
        }

        // 2x scale up callGas and add margin for postop
        this.userOperation.callGas = web3_utils.toHex(
            toFixed(multipliedBy(this.userOperation.callGas ?? '0', 2).plus(POSTOP), 0),
        )

        // recover to the original callGas when extra gas could be provided
        if (isGreaterThan(callGas ?? '0', this.userOperation.callGas)) {
            this.userOperation.callGas = callGas
        }

        if (isZeroString(maxFeePerGas)) {
            try {
                const block = await web3.eth.getBlock('latest')
                this.userOperation.maxFeePerGas = toFixed(
                    new BigNumber(block.baseFeePerGas ?? 0).plus(
                        maxPriorityFeePerGas ?? DEFAULT_USER_OPERATION.maxPriorityFeePerGas,
                    ),
                )
            } catch (error) {
                this.userOperation.maxFeePerGas = DEFAULT_USER_OPERATION.maxPriorityFeePerGas
            }
        }

        if (isZeroString(maxPriorityFeePerGas)) {
            this.userOperation.maxPriorityFeePerGas = DEFAULT_USER_OPERATION.maxPriorityFeePerGas
        }

        // add more verification gas according to the size of initCode
        if (!isEmptyHex(initCode)) {
            this.userOperation.verificationGas = toFixed(
                new BigNumber(DEFAULT_USER_OPERATION.verificationGas).plus(32000 + (200 * initCode.length) / 2),
            )
        } else {
            this.userOperation.verificationGas = DEFAULT_USER_OPERATION.verificationGas
        }
        if (isZeroString(preVerificationGas)) {
            this.userOperation.preVerificationGas = toFixed(
                Math.max(
                    web3_utils
                        .hexToBytes(this.packAll)
                        .map<number>((x) => (x === 0 ? 4 : 16))
                        .reduce((sum, x) => sum + x),
                    Number.parseInt(DEFAULT_USER_OPERATION.preVerificationGas, 10),
                ),
            )
        }
        if (!this.paymentToken || isZeroAddress(this.paymentToken)) {
            const { PAYMASTER_MASK_CONTRACT_ADDRESS, PAYMASTER_NATIVE_CONTRACT_ADDRESS } = getSmartPayConstants(
                this.chainId,
            )
            if (!PAYMASTER_MASK_CONTRACT_ADDRESS && !PAYMASTER_NATIVE_CONTRACT_ADDRESS)
                throw new Error('No paymaster address.')

            if (!this.paymentToken || isNativeTokenAddress(this.paymentToken)) {
                this.userOperation.paymaster = PAYMASTER_NATIVE_CONTRACT_ADDRESS
            } else {
                this.userOperation.paymaster = PAYMASTER_MASK_CONTRACT_ADDRESS
                this.userOperation.paymasterData = web3_utils.padLeft(this.paymentToken, 64)
            }
        }

        return this
    }

    estimateUserOperation() {
        const { callGas = DEFAULT_USER_OPERATION.callGas } = this.userOperation
        return web3_utils.toHex(callGas)
    }

    async signUserOperation(signer: Signer<ECKeyIdentifier> | Signer<string>): Promise<UserOperation> {
        const { nonce, callGas, verificationGas, preVerificationGas, maxFeePerGas, maxPriorityFeePerGas } =
            this.userOperation
        return {
            ...this.userOperation,
            sender: formatEthereumAddress(this.userOperation.sender),
            nonce,
            callGas: callGas ? toFixed(callGas) : '0',
            verificationGas: verificationGas ? toFixed(verificationGas) : '0',
            preVerificationGas: preVerificationGas ? toFixed(preVerificationGas) : '0',
            maxFeePerGas: maxFeePerGas ? toFixed(maxFeePerGas) : '0',
            maxPriorityFeePerGas: maxPriorityFeePerGas ? toFixed(maxPriorityFeePerGas) : '0',
            signature: await signer.signMessage(this.requestId),
        }
    }

    static fromTransaction(
        chainId: ChainId,
        entryPoint: string,
        transaction: Transaction,
        options?: Options,
    ): UserTransaction {
        return new UserTransaction(chainId, entryPoint, UserTransaction.toUserOperation(chainId, transaction), options)
    }

    static fromUserOperation(
        chainId: ChainId,
        entryPoint: string,
        userOperation: UserOperation,
        options?: Options,
    ): UserTransaction {
        const { PAYMENT_TOKEN_ADDRESS } = getSmartPayConstants(chainId)

        return new UserTransaction(chainId, entryPoint, UserTransaction.fillUserOperation(chainId, userOperation), {
            paymentToken: options?.paymentToken ?? PAYMENT_TOKEN_ADDRESS,
            ...options,
        })
    }

    static fillUserOperation(chainId: ChainId, userOperation: UserOperation) {
        const { PAYMASTER_MASK_CONTRACT_ADDRESS, PAYMENT_TOKEN_ADDRESS } = getSmartPayConstants(chainId)

        return {
            ...DEFAULT_USER_OPERATION,
            paymaster: PAYMASTER_MASK_CONTRACT_ADDRESS || DEFAULT_USER_OPERATION.paymaster,
            paymasterData:
                PAYMENT_TOKEN_ADDRESS ?
                    web3_utils.padLeft(PAYMENT_TOKEN_ADDRESS, 64)
                :   DEFAULT_USER_OPERATION.paymasterData,
            ...userOperation,
        }
    }

    static toUserOperation(chainId: ChainId, transaction: Transaction): UserOperation {
        const { from, to, nonce = 0, value = '0', data = '0x' } = transaction
        if (!from) throw new Error('No sender address.')
        if (!to) throw new Error('No destination address.')

        return UserTransaction.fillUserOperation(chainId, {
            sender: formatEthereumAddress(from),
            nonce: web3_utils.toNumber(nonce) as number,
            callGas: transaction.gas ?? DEFAULT_USER_OPERATION.callGas,
            callData: abiCoder.encodeFunctionCall(CALL_WALLET_TYPE, [to, value, data]),
            maxFeePerGas: transaction.maxFeePerGas ?? transaction.gasPrice ?? DEFAULT_USER_OPERATION.maxFeePerGas,
            maxPriorityFeePerGas:
                transaction.maxPriorityFeePerGas ?? transaction.gasPrice ?? DEFAULT_USER_OPERATION.maxPriorityFeePerGas,
            signature: '0x',
        })
    }

    static toTransaction(chainId: ChainId, userOperation: UserOperation): Transaction {
        const parameters =
            !isEmptyHex(userOperation.callData) ?
                (abiCoder.decodeParameters(CALL_WALLET_TYPE.inputs ?? [], userOperation.callData.slice(10)) as {
                    dest: string
                    value: string
                    func: string
                })
            :   undefined

        return {
            chainId,
            from: userOperation.sender,
            to: parameters?.dest,
            value: web3_utils.toHex(parameters?.value ?? '0'),
            gas: userOperation.callGas,
            maxFeePerGas: userOperation.maxFeePerGas,
            maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
            nonce: web3_utils.toNumber(userOperation.nonce ?? '0') as number,
            data: parameters?.func ?? '0x',
        }
    }
}
