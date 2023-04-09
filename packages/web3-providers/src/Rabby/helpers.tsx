import {
    type ChainId,
    getRedPacketConstants,
    getMaskBoxConstants,
    getITOConstants,
    getNftRedPacketConstants,
    NetworkType,
} from '@masknet/web3-shared-evm'
import { createLookupTableResolver } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'

export function getAllMaskDappContractInfo(chainId: ChainId, type: 'token' | 'nft') {
    const {
        HAPPY_RED_PACKET_ADDRESS_V1,
        HAPPY_RED_PACKET_ADDRESS_V2,
        HAPPY_RED_PACKET_ADDRESS_V3,
        HAPPY_RED_PACKET_ADDRESS_V4,
    } = getRedPacketConstants(chainId)
    const { ITO_CONTRACT_ADDRESS, ITO2_CONTRACT_ADDRESS } = getITOConstants(chainId)
    const { MASK_BOX_CONTRACT_ADDRESS } = getMaskBoxConstants(chainId)
    const { RED_PACKET_NFT_ADDRESS } = getNftRedPacketConstants(chainId)
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
