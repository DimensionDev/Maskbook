import {
    ChainId,
    useRedPacketConstants,
    useMaskBoxConstants,
    useITOConstants,
    useNftRedPacketConstants,
} from '@masknet/web3-shared-evm'
import { RedPacketIcon, Ito, MaskBoxIcon } from '@masknet/icons'
export function useAllMaskDappContractInfo(chainId: ChainId, type: 'token' | 'nft') {
    const {
        HAPPY_RED_PACKET_ADDRESS_V1,
        HAPPY_RED_PACKET_ADDRESS_V2,
        HAPPY_RED_PACKET_ADDRESS_V3,
        HAPPY_RED_PACKET_ADDRESS_V4,
    } = useRedPacketConstants(chainId)
    const { ITO_CONTRACT_ADDRESS, ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const { MASK_BOX_CONTRACT_ADDRESS } = useMaskBoxConstants(chainId)
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)
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
                  logo: <Ito />,
              },
              {
                  address: ITO2_CONTRACT_ADDRESS,
                  name: 'ITO V2',
                  logo: <Ito />,
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
