import type { AbiItem } from 'web3-utils'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'
import type { HappyRedPacket } from '../../../contracts/happy-red-packet/HappyRedPacket'
import HappyRedPacketABI from '../../../contracts/happy-red-packet/HappyRedPacket.json'

export function useITO_Contract() {
    const address = useConstant(ITO_CONSTANTS, 'ITO_ADDRESS')
    return useContract<HappyRedPacket>(address, HappyRedPacketABI as AbiItem[])
}
