import {
    createContractWithAddress,
    createTransactionRequest,
    encodeContractFunctionData,
    estimateContractGas,
    getFunctionInputs,
    normalizeFunctionArgs,
    type ContractCallOptions,
    type ContractWithAddress,
    type ContractWriteOptions,
} from '@masknet/web3-shared-evm'

import { AirdropV2Abi as AirDropV2ABI } from '@masknet/web3-contracts/types/AirdropV2.js'
import { BalanceCheckerAbi as BalanceCheckerABI } from '@masknet/web3-contracts/types/BalanceChecker.js'
import { ERC20Abi as ERC20ABI } from '@masknet/web3-contracts/types/ERC20.js'
import { ERC20Bytes32Abi as ERC20Bytes32ABI } from '@masknet/web3-contracts/types/ERC20Bytes32.js'
import { ERC165Abi as ERC165ABI } from '@masknet/web3-contracts/types/ERC165.js'
import { ERC721Abi as ERC721ABI } from '@masknet/web3-contracts/types/ERC721.js'
import { ERC1155Abi as ERC1155ABI } from '@masknet/web3-contracts/types/ERC1155.js'
import { WalletAbi as WalletABI } from '@masknet/web3-contracts/types/Wallet.js'

import { EVMRequestReadonlyAPI } from './RequestReadonlyAPI.js'
import type { EVMConnectionOptions } from '../types/index.js'
import type {
    Abi,
    AbiStateMutability,
    Address,
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionReturnType,
} from 'viem'

export class EVMContractReadonlyAPI {
    static Default = new EVMContractReadonlyAPI()
    constructor(protected options?: EVMConnectionOptions) {
        this.Request = new EVMRequestReadonlyAPI(options)
    }
    protected Request

    getContract<TAbi extends Abi>(address: string | undefined, abi: TAbi) {
        return createContractWithAddress(address, abi)
    }

    async readContract<
        TAbi extends Abi,
        TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
        TArgs extends ContractFunctionArgs<TAbi, 'pure' | 'view', TFunctionName>,
    >(
        contract: ContractWithAddress<TAbi> | null | undefined,
        functionName: TFunctionName,
        args: TArgs = [] as TArgs,
        initial?: EVMConnectionOptions & ContractCallOptions,
    ): Promise<ContractFunctionReturnType<TAbi, 'pure' | 'view', TFunctionName, TArgs> | undefined> {
        if (!contract) return
        const client = this.Request.getViem(initial)
        const block = normalizeBlock(initial?.block)
        return client.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName,
            args: normalizeFunctionArgs(args as readonly unknown[], getFunctionInputs(contract.abi, functionName)),
            account: (initial?.account ?? initial?.from) as Address | undefined,
            ...block,
        } as Parameters<typeof client.readContract>[0]) as Promise<
            ContractFunctionReturnType<TAbi, 'pure' | 'view', TFunctionName, TArgs>
        >
    }

    estimateContractGas<
        TAbi extends Abi,
        TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
        TArgs extends ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>,
    >(
        contract: ContractWithAddress<TAbi> | null | undefined,
        functionName: TFunctionName,
        args: TArgs = [] as unknown as TArgs,
        initial?: EVMConnectionOptions & ContractCallOptions,
    ) {
        return estimateContractGas(this.Request.getViem(initial), contract, functionName, args, initial)
    }

    encodeContractFunctionData<
        TAbi extends Abi,
        TFunctionName extends ContractFunctionName<TAbi>,
        TArgs extends ContractFunctionArgs<TAbi, AbiStateMutability, TFunctionName>,
    >(abi: TAbi, functionName: TFunctionName, args: TArgs = [] as unknown as TArgs) {
        return encodeContractFunctionData(abi, functionName, args)
    }

    createTransactionRequest<
        TAbi extends Abi,
        TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
        TArgs extends ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>,
    >(
        contract: ContractWithAddress<TAbi> | null | undefined,
        functionName: TFunctionName,
        args: TArgs = [] as unknown as TArgs,
        initial?: ContractWriteOptions,
    ) {
        return createTransactionRequest(contract, functionName, args, initial)
    }

    getERC20Contract(address: string | undefined) {
        return this.getContract(address, ERC20ABI)
    }

    getERC20Bytes32Contract(address: string | undefined) {
        return this.getContract(address, ERC20Bytes32ABI)
    }

    getERC721Contract(address: string | undefined) {
        return this.getContract(address, ERC721ABI)
    }

    getERC1155Contract(address: string | undefined) {
        return this.getContract(address, ERC1155ABI)
    }

    getERC165Contract(address: string | undefined) {
        return this.getContract(address, ERC165ABI)
    }

    getBalanceCheckerContract(address: string | undefined) {
        return this.getContract(address, BalanceCheckerABI)
    }

    getWalletContract(address: string | undefined) {
        return this.getContract(address, WalletABI)
    }

    getAirdropV2Contract(address: string | undefined) {
        return this.getContract(address, AirDropV2ABI)
    }
}
export const EVMContractReadonly = EVMContractReadonlyAPI.Default

function normalizeBlock(
    block: string | number | bigint | undefined,
): undefined | { blockNumber: bigint; blockTag: undefined } | { blockNumber: undefined; blockTag: string } {
    if (typeof block === 'bigint') return { blockNumber: block, blockTag: undefined }
    if (typeof block === 'number') return { blockNumber: BigInt(block), blockTag: undefined }
    if (typeof block === 'string' && /^\d+$/u.test(block)) return { blockNumber: BigInt(block), blockTag: undefined }
    if (typeof block === 'string' && /^0x[\da-f]+$/iu.test(block))
        return { blockNumber: BigInt(block), blockTag: undefined }
    if (typeof block === 'string') return { blockNumber: undefined, blockTag: block }
    return
}
