import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import {
    createContract,
    ChainId,
    getERC20TokenDetailed,
    ERC20TokenDetailed,
    FungibleToken,
    FungibleTokenDetailed,
} from '@masknet/web3-shared-evm'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'

export function splitToPair(a: FungibleTokenDetailed[] | undefined) {
    if (!a) {
        return []
    }
    return a.reduce(function (result: any, value, index, array) {
        if (index % 2 === 0) {
            result.push(array.slice(index, index + 2))
        }
        return result
    }, [])
}

export async function getFungibleTokensDetailed(
    allTokens: Pick<FungibleToken, 'address'>[],
    web3: Web3,
    chainId: ChainId,
) {
    return Promise.all(
        allTokens.map(async (token, i) => {
            const erc20TokenContract = createContract<ERC20>(web3, token.address, ERC20ABI as AbiItem[])
            const erc20TokenBytes32Contract = createContract<ERC20Bytes32>(
                web3,
                token.address,
                ERC20Bytes32ABI as AbiItem[],
            )
            return getERC20TokenDetailed(
                token.address,
                chainId,
                erc20TokenContract,
                erc20TokenBytes32Contract,
                token as Partial<ERC20TokenDetailed>,
            )
        }),
    )
}
