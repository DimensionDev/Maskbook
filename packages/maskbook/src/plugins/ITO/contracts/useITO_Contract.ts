import type { AbiItem } from 'web3-utils'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'
import type { Ito as ITO } from '../../../contracts/ito/ito'
import ITO_ABI from '../../../contracts/ito/ito.json'

export function useITO_Contract() {
    const address = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    return useContract<ITO>(address, ITO_ABI as AbiItem[])
}
