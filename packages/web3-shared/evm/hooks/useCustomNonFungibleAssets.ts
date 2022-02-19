import { useWeb3Context } from '../context'
import { isSameAddress } from '../utils'
import type { ChainId } from '../types'

export function useCustomNonFungibleAssets(address: string, chainId: ChainId | null) {
    const { erc721Tokens } = useWeb3Context()

    return erc721Tokens
        .getCurrentValue()
        .filter((x) => (!chainId || x.contractDetailed.chainId === chainId) && isSameAddress(x.info.owner, address))
}
