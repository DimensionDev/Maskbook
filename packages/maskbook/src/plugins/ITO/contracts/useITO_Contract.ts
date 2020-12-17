import type { AbiItem } from 'web3-utils'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'
import ITO_ABI from '../../../../abis/ITO.json'
import type { ITO } from '../../../contracts/ito'

export function useITO_Contract() {
    const address = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    return useContract<ITO>(address, ITO_ABI as AbiItem[])
}
