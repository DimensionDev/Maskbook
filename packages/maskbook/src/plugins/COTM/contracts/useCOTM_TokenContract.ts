import type { AbiItem } from 'web3-utils'
import type { CotmToken as COTM_Token } from '../../../contracts/cotm-token/COTM_Token'
import COTM_TokenABI from '../../../contracts/cotm-token/COTM_Token.json'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useContract } from '../../../web3/hooks/useContract'
import { COTM_CONSTANTS } from '../constants'

export function useCOTM_TokenContract() {
    const address = useConstant(COTM_CONSTANTS, 'COTM_TOKEN_ADDRESS')
    return useContract<COTM_Token>(address, COTM_TokenABI as AbiItem[])
}
