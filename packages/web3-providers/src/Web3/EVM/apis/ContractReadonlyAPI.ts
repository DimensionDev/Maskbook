import {
    createContractWithAddress,
    createTransactionRequest,
    encodeContractFunctionData,
    estimateContractGas,
    readContract,
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

    readContract<
        TAbi extends Abi,
        TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
        TArgs extends ContractFunctionArgs<TAbi, 'pure' | 'view', TFunctionName>,
    >(
        contract: ContractWithAddress<TAbi> | null | undefined,
        functionName: TFunctionName,
        args: TArgs = [] as unknown as TArgs,
        initial?: EVMConnectionOptions & ContractCallOptions,
    ): Promise<ContractFunctionReturnType<TAbi, 'pure' | 'view', TFunctionName, TArgs> | undefined> {
        return readContract(this.Request.getViem(initial), contract, functionName, args, initial)
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

    getERC20Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        void initial
        return this.getContract(address, ERC20ABI)
    }

    getERC20Bytes32Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        void initial
        return this.getContract(address, ERC20Bytes32ABI)
    }

    getERC721Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        void initial
        return this.getContract(address, ERC721ABI)
    }

    getERC1155Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        void initial
        return this.getContract(address, ERC1155ABI)
    }

    getERC165Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        void initial
        return this.getContract(address, ERC165ABI)
    }

    getBalanceCheckerContract(address: string | undefined, initial?: EVMConnectionOptions) {
        void initial
        return this.getContract(address, BalanceCheckerABI)
    }

    getWalletContract(address: string | undefined, initial?: EVMConnectionOptions) {
        void initial
        return this.getContract(address, WalletABI)
    }

    getAirdropV2Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        void initial
        return this.getContract(address, AirDropV2ABI)
    }
}
export const EVMContractReadonly = EVMContractReadonlyAPI.Default
