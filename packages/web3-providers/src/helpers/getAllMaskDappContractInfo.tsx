import {
    type ChainId,
    getMaskBoxConstant,
    getRedPacketConstant,
    getNftRedPacketConstant,
} from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'

export function getAllMaskDappContractInfo(chainId: ChainId, type: 'token' | 'nft') {
    const HAPPY_RED_PACKET_ADDRESS_V1 = getRedPacketConstant(chainId, 'HAPPY_RED_PACKET_ADDRESS_V1')
    const HAPPY_RED_PACKET_ADDRESS_V2 = getRedPacketConstant(chainId, 'HAPPY_RED_PACKET_ADDRESS_V2')
    const HAPPY_RED_PACKET_ADDRESS_V3 = getRedPacketConstant(chainId, 'HAPPY_RED_PACKET_ADDRESS_V3')
    const HAPPY_RED_PACKET_ADDRESS_V4 = getRedPacketConstant(chainId, 'HAPPY_RED_PACKET_ADDRESS_V4')
    const MASK_BOX_CONTRACT_ADDRESS = getMaskBoxConstant(chainId, 'MASK_BOX_CONTRACT_ADDRESS')
    const RED_PACKET_NFT_ADDRESS = getNftRedPacketConstant(chainId, 'RED_PACKET_NFT_ADDRESS')
    return type === 'token'
        ? [
              {
                  address: HAPPY_RED_PACKET_ADDRESS_V1,
                  name: 'Lucky Drop V1',
                  logo: <Icons.RedPacket />,
              },
              {
                  address: HAPPY_RED_PACKET_ADDRESS_V2,
                  name: 'Lucky Drop V2',
                  logo: <Icons.RedPacket />,
              },
              {
                  address: HAPPY_RED_PACKET_ADDRESS_V3,
                  name: 'Lucky Drop V3',
                  logo: <Icons.RedPacket />,
              },
              {
                  address: HAPPY_RED_PACKET_ADDRESS_V4,
                  name: 'Lucky Drop V4',
                  logo: <Icons.RedPacket />,
              },
          ]
        : [
              {
                  address: MASK_BOX_CONTRACT_ADDRESS,
                  name: 'Mask Box',
                  logo: <Icons.MaskBox />,
              },
              {
                  address: RED_PACKET_NFT_ADDRESS,
                  name: 'NFT Lucky Drop',
                  logo: <Icons.RedPacket />,
              },
          ]
}
