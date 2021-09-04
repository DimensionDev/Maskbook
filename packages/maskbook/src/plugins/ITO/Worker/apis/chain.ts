import { ChainId, getChainConstants, getITOConstants, isSameAddress } from '@masknet/web3-shared'
import { Interface } from '@ethersproject/abi'
import ITO_ABI from '@masknet/web3-contracts/abis/ITO2.json'
import urlcat from 'urlcat'

const interFace = new Interface(ITO_ABI)

export async function getAllPoolsAsSeller(
    chainId: ChainId,
    startBlock: number,
    endBlock: number,
    sellerAddress: string,
) {
    const { EXPLORER_API, EXPLORER_API_KEY } = getChainConstants(chainId)
    const { ITO2_CONTRACT_ADDRESS } = getITOConstants(chainId)

    if (!EXPLORER_API || !ITO2_CONTRACT_ADDRESS) return null

    //#region 1. Get all `Fill_Pool` transactions
    const response = await fetch(
        urlcat(EXPLORER_API, {
            apikey: EXPLORER_API_KEY,
            action: 'txlist',
            module: 'account',
            sort: 'asc',
            startBlock,
            endBlock,
            address: ITO2_CONTRACT_ADDRESS,
        }),
    )
    if (!response.ok) return null

    type TxType = {
        hash: string
        input: string
        from: string
    }

    const transactions: TxType[] = (await response.json()).result.filter((result: TxType) => {
        let isFillPool: boolean

        try {
            interFace.decodeFunctionData('fill_pool', result.input)
            isFillPool = true
        } catch (error) {
            isFillPool = false
        }

        return isFillPool && isSameAddress(result.from, sellerAddress)
    })
    //#endregion

    //#region 2. Get all
    //#endregion
    return null
}
