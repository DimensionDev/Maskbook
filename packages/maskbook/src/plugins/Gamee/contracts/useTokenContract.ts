import type { AbiItem } from 'web3-utils'
import ERC721ABI from '@dimensiondev/contracts/abis/ERC721.json'
import type { ERC721 } from '@dimensiondev/contracts/types/ERC721'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useContract } from '../../../web3/hooks/useContract'
import { GAMEE_CONSTANTS } from '../constants'

export function useTokenContract() {
    const address = useConstant(GAMEE_CONSTANTS, 'TOKEN_ADDRESS')
    return useContract<ERC721>(address, ERC721ABI as AbiItem[])
}
