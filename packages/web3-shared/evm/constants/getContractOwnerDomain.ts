import Aave from '@masknet/web3-constants/evm/aave.json'
import Airdrop from '@masknet/web3-constants/evm/airdrop.json'
import ArtBlocks from '@masknet/web3-constants/evm/artblocks.json'
import CryptoArtAI from '@masknet/web3-constants/evm/cryptoartai.json'
import Gitcoin from '@masknet/web3-constants/evm/gitcoin.json'
import GoodGhosting from '@masknet/web3-constants/evm/good-ghosting.json'
import ITO from '@masknet/web3-constants/evm/ito.json'
import Lido from '@masknet/web3-constants/evm/lido.json'
import MaskBox from '@masknet/web3-constants/evm/mask-box.json'
import NftRedPacket from '@masknet/web3-constants/evm/nft-red-packet.json'
import PoolTogether from '@masknet/web3-constants/evm/pooltogether.json'
import RedPacket from '@masknet/web3-constants/evm/red-packet.json'
import Trader from '@masknet/web3-constants/evm/trader.json'
import { filter, flatten, pick, uniq, values } from 'lodash-unified'

const collect = <T extends Record<string, Record<string, string | number>>>(
    data: T,
    fields: Array<keyof T>,
): string[] => {
    const groupedByFields = values(pick(data, fields))
    const listOfAddresses = groupedByFields.map((v) => values(v))
    const listOfAddress = flatten(listOfAddresses)
    const collected = filter(uniq(listOfAddress), Boolean) as string[]
    return collected.map((addr) => addr.toLowerCase())
}

const domainAddressMap: Record<string, string[]> = {
    'uniswap.org': collect(Trader, [
        'UNISWAP_V2_ROUTER_ADDRESS',
        'UNISWAP_V2_FACTORY_ADDRESS',
        'UNISWAP_SWAP_ROUTER_ADDRESS',
        'UNISWAP_V3_FACTORY_ADDRESS',
        'UNISWAP_V3_QUOTER_ADDRESS',
    ]),
    'defikingdoms.com': collect(Trader, ['DEFIKINGDOMS_ROUTER_ADDRESS', 'DEFIKINGDOMS_FACTORY_ADDRESS']),
    'app.openswap.one': collect(Trader, ['OPENSWAP_ROUTER_ADDRESS', 'OPENSWAP_FACTORY_ADDRESS']),
    'viper.exchange': collect(Trader, ['VENOMSWAP_ROUTER_ADDRESS', 'VENOMSWAP_FACTORY_ADDRESS']),
    'viperswap.one': collect(Trader, ['VENOMSWAP_ROUTER_ADDRESS', 'VENOMSWAP_FACTORY_ADDRESS']),
    'www.sushi.com': collect(Trader, ['SUSHISWAP_ROUTER_ADDRESS', 'SUSHISWAP_FACTORY_ADDRESS']),
    'quickswap.exchange': collect(Trader, ['QUICKSWAP_ROUTER_ADDRESS', 'QUICKSWAP_FACTORY_ADDRESS']),
    'pancakeswap.finance': collect(Trader, ['PANCAKESWAP_ROUTER_ADDRESS', 'PANCAKESWAP_FACTORY_ADDRESS']),
    'balancer.fi': collect(Trader, ['BALANCER_EXCHANGE_PROXY_ADDRESS']),
    'dodoex.io': collect(Trader, ['DODO_EXCHANGE_PROXY_ADDRESS']),
    'www.bancor.network': collect(Trader, ['BANCOR_EXCHANGE_PROXY_ADDRESS']),
    'traderjoexyz.com': collect(Trader, ['TRADERJOE_ROUTER_ADDRESS', 'TRADERJOE_FACTORY_ADDRESS']),
    'openocean.finance': collect(Trader, ['OPENOCEAN_EXCHANGE_PROXY_ADDRESS']),
    'pangolin.exchange': collect(Trader, ['PANGOLIN_ROUTER_ADDRESS', 'PANGOLIN_FACTORY_ADDRESS']),
    'wannaswap.finance': collect(Trader, [
        'WANNASWAP_ROUTER_V2_ADDRESS',
        'WANNASWAP_ROUTER_ADDRESS',
        'WANNASWAP_FACTORY_ADDRESS',
    ]),
    'legacy.elk.finance': collect(Trader, ['ELKFINANCE_ROUTER_ADDRESS', 'ELKFINANCE_FACTORY_ADDRESS']),
    'app.elk.finance': collect(Trader, ['ELKFINANCE_ROUTER_ADDRESS', 'ELKFINANCE_FACTORY_ADDRESS']),
    'zipswap.fi': collect(Trader, ['ZIPSWAP_ROUTER_ADDRESS', 'ZIPSWAP_FACTORY_ADDRESS']),
    'www.trisolaris.io': collect(Trader, ['TRISOLARIS_ROUTER_ADDRESS', 'TRISOLARIS_FACTORY_ADDRESS']),
    'mdex.com': collect(Trader, ['MDEX_ROUTER_ADDRESS', 'MDEX_FACTORY_ADDRESS']),
    'aave.com': collect(Aave, ['AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS']),
    'www.artblocks.io': collect(ArtBlocks, ['GEN_ART_721_MINTER']),
    'www.cryptoart.ai': collect(CryptoArtAI, ['ARTIST_ACCEPTING_BIDS_V2', 'ARTIST_ACCEPTING_BIDS_V2', 'CANFT_MARKET']),
    'gitcoin.co': collect(Gitcoin, ['GITCOIN_ETH_ADDRESS', 'BULK_CHECKOUT_ADDRESS']),
    'goodghosting.com': collect(GoodGhosting, ['GOOD_GHOSTING_INCENTIVES_CONTRACT_ADDRESS']),
    'lido.fi': collect(Lido, ['LIDO_stETH_ADDRESS', 'LIDO_REFERRAL_ADDRESS']),
    'pooltogether.com': collect(PoolTogether, ['MASK_POOL_ADDRESS']),
    'mask.io': [
        ...collect(Airdrop, ['AIRDROP_CONTRACT_ADDRESS']),
        ...collect(ITO, ['ITO_CONTRACT_ADDRESS']),
        ...collect(RedPacket, [
            'HAPPY_RED_PACKET_ADDRESS_V1',
            'HAPPY_RED_PACKET_ADDRESS_V2',
            'HAPPY_RED_PACKET_ADDRESS_V3',
            'HAPPY_RED_PACKET_ADDRESS_V4',
        ]),
        ...collect(NftRedPacket, ['RED_PACKET_NFT_ADDRESS']),
        ...collect(MaskBox, ['MASK_BOX_CONTRACT_ADDRESS']),
    ],
}

// Not very common usage, no need to create a map of address-to-domain
export function getContractOwnerDomain(address?: string) {
    if (!address) return address
    const addr = address.toLowerCase()
    const pair = Object.entries(domainAddressMap).find(([, addresses]) => {
        return addresses.includes(addr)
    })
    return pair ? pair[0] : addr
}
