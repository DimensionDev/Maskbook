import {
    type ChainId,
    getMaskBoxConstant,
    getRedPacketConstant,
    getITOConstant,
    getNftRedPacketConstant,
    NetworkType,
} from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { createLookupTableResolver } from '@masknet/shared-base'

export function getAllMaskDappContractInfo(chainId: ChainId, type: 'token' | 'nft') {
    const HAPPY_RED_PACKET_ADDRESS_V1 = getRedPacketConstant(chainId, 'HAPPY_RED_PACKET_ADDRESS_V1')
    const HAPPY_RED_PACKET_ADDRESS_V2 = getRedPacketConstant(chainId, 'HAPPY_RED_PACKET_ADDRESS_V2')
    const HAPPY_RED_PACKET_ADDRESS_V3 = getRedPacketConstant(chainId, 'HAPPY_RED_PACKET_ADDRESS_V3')
    const HAPPY_RED_PACKET_ADDRESS_V4 = getRedPacketConstant(chainId, 'HAPPY_RED_PACKET_ADDRESS_V4')
    const ITO_CONTRACT_ADDRESS = getITOConstant(chainId, 'ITO_CONTRACT_ADDRESS')
    const ITO2_CONTRACT_ADDRESS = getITOConstant(chainId, 'ITO2_CONTRACT_ADDRESS')
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
              {
                  address: ITO_CONTRACT_ADDRESS,
                  name: 'ITO V1',
                  logo: <Icons.ITO />,
              },
              {
                  address: ITO2_CONTRACT_ADDRESS,
                  name: 'ITO V2',
                  logo: <Icons.ITO />,
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

export const resolveNetworkOnRabby = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'eth',
        [NetworkType.Binance]: 'bsc',
        [NetworkType.Base]: 'base',
        [NetworkType.Polygon]: 'matic',
        [NetworkType.Arbitrum]: 'arb',
        [NetworkType.xDai]: 'xdai',
        [NetworkType.Avalanche]: 'avax',
        [NetworkType.Fantom]: 'ftm',
        [NetworkType.Aurora]: 'aurora',
        [NetworkType.Fuse]: '',
        [NetworkType.Metis]: '',
        [NetworkType.Boba]: '',
        [NetworkType.Optimism]: '',
        [NetworkType.Celo]: '',
        [NetworkType.Conflux]: '',
        [NetworkType.Astar]: '',
        [NetworkType.Moonbeam]: '',
    },
    'eth',
)
