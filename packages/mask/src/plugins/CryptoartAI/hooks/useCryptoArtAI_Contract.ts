import type { AbiItem } from 'web3-utils'
import KnownOriginDigitalAssetV2_ABI from '@masknet/web3-contracts/abis/CryptoArtAIKnownOriginDigitalAssetV2.json'
import ArtistAcceptingBidsV2_ABI from '@masknet/web3-contracts/abis/CryptoArtAIArtistAcceptingBidsV2.json'
import CANFTMarket_ABI from '@masknet/web3-contracts/abis/CryptoArtAICANFTMarket.json'
import type { CryptoArtAIKnownOriginDigitalAssetV2 } from '@masknet/web3-contracts/types/CryptoArtAIKnownOriginDigitalAssetV2'
import type { CryptoArtAIArtistAcceptingBidsV2 } from '@masknet/web3-contracts/types/CryptoArtAIArtistAcceptingBidsV2'
import type { CryptoArtAICANFTMarket } from '@masknet/web3-contracts/types/CryptoArtAICANFTMarket'
import { ChainId, useCryptoArtAIConstants } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'

export function useCryptoArtAI_Contract(chainId?: ChainId) {
    const { KNOWN_ORIGIN_DIGITAL_ASSET_V2, ARTIST_ACCEPTING_BIDS_V2, CANFT_MARKET } = useCryptoArtAIConstants()
    const KnownOriginDigitalAssetV2_CONTRACT = useContract<CryptoArtAIKnownOriginDigitalAssetV2>(
        chainId,
        KNOWN_ORIGIN_DIGITAL_ASSET_V2,
        KnownOriginDigitalAssetV2_ABI as AbiItem[],
    )
    const ArtistAcceptingBidsV2_CONTRACT = useContract<CryptoArtAIArtistAcceptingBidsV2>(
        chainId,
        ARTIST_ACCEPTING_BIDS_V2,
        ArtistAcceptingBidsV2_ABI as AbiItem[],
    )
    const CANFTMarket_CONTRACT = useContract<CryptoArtAICANFTMarket>(
        chainId,
        CANFT_MARKET,
        CANFTMarket_ABI as AbiItem[],
    )

    return {
        knownOriginDigitalAssetV2_contract: KnownOriginDigitalAssetV2_CONTRACT,
        artistAcceptingBidsV2_contract: ArtistAcceptingBidsV2_CONTRACT,
        cANFTMarket_contract: CANFTMarket_CONTRACT,
    }
}
