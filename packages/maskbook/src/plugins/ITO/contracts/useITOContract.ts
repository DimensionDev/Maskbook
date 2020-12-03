import type { AbiItem } from 'web3-utils'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useContract } from '../../../web3/hooks/useContract'
import type { HappyRedPacket } from '../../../contracts/happy-red-packet/HappyRedPacket'
import HappyRedPacketABI from '../../../contracts/happy-red-packet/HappyRedPacket.json'
import { ITO_CONSTANTS } from '../constants'

export function useITOContract() {
    const address = useConstant(ITO_CONSTANTS, 'HAPPY_ITO_ADDRESS')
    return useContract<HappyRedPacket>(address, HappyRedPacketABI as AbiItem[])
}
