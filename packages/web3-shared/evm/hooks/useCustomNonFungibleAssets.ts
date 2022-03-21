import { useWeb3Context } from '../context'
import { isSameAddress } from '../utils'
import type { ChainId } from '../types'

// Only support EVM network currently.
export function useCustomNonFungibleAssets(
    address: string,
    chainId: ChainId | null | undefined,
    isEVM_Mainnet: boolean,
) {
    const { erc721Tokens } = useWeb3Context()

    return isEVM_Mainnet
        ? erc721Tokens
              .getCurrentValue()
              .filter(
                  (x) => (!chainId || x.contractDetailed.chainId === chainId) && isSameAddress(x.info.owner, address),
              )
        : []
}
