import {
    ChainId,
    getRedPacketConstants,
    getMaskBoxConstants,
    getITOConstants,
    getNftRedPacketConstants,
    NetworkType,
} from '@masknet/web3-shared-evm'
import { createLookupTableResolver } from '@masknet/web3-shared-base'
import { RedPacketIcon, Ito as ITOIcon, MaskBoxIcon } from '@masknet/icons'

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
                  logo: <RedPacketIcon />,
              },
              {
                  address: HAPPY_RED_PACKET_ADDRESS_V2,
                  name: 'Lucky Drop V2',
                  logo: <RedPacketIcon />,
              },
              {
                  address: HAPPY_RED_PACKET_ADDRESS_V3,
                  name: 'Lucky Drop V3',
                  logo: <RedPacketIcon />,
              },
              {
                  address: HAPPY_RED_PACKET_ADDRESS_V4,
                  name: 'Lucky Drop V4',
                  logo: <RedPacketIcon />,
              },
              {
                  address: ITO_CONTRACT_ADDRESS,
                  name: 'ITO V1',
                  logo: <ITOIcon />,
              },
              {
                  address: ITO2_CONTRACT_ADDRESS,
                  name: 'ITO V2',
                  logo: <ITOIcon />,
              },
          ]
        : [
              {
                  address: MASK_BOX_CONTRACT_ADDRESS,
                  name: 'Mask Box',
                  logo: <MaskBoxIcon />,
              },
              {
                  address: RED_PACKET_NFT_ADDRESS,
                  name: 'NFT Lucky Drop',
                  logo: <RedPacketIcon />,
              },
          ]
}

export const resolveNetworkOnRabby = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'eth',
        [NetworkType.Binance]: 'bsc',
        [NetworkType.Polygon]: 'matic',
        [NetworkType.Arbitrum]: 'arbitrum',
        [NetworkType.xDai]: 'xdai',
        [NetworkType.Avalanche]: 'avax',
        [NetworkType.Fantom]: 'ftm',
        [NetworkType.Aurora]: 'aurora',
        [NetworkType.Harmony]: 'hmy',
        [NetworkType.Fuse]: '',
        [NetworkType.Metis]: '',
        [NetworkType.Boba]: '',
        [NetworkType.Optimism]: '',
        [NetworkType.Celo]: '',
        [NetworkType.Conflux]: '',
    },
    'eth',
)
