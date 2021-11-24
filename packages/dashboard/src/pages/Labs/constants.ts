export const PLUGIN_IDS = {
    FILE_SERVICE: 'com.maskbook.fileservice',
    GITCOIN: 'co.gitcoin',
    DHEDGE: 'co.dhedge',
    RED_PACKET: 'com.maskbook.red_packet',
    TRANSAK: 'com.maskbook.transak',
    COLLECTIBLES: 'com.maskbook.collectibles',
    SWAP: 'com.maskbook.trader',
    SNAPSHOT: 'org.snapshot',
    MARKETS: 'com.maskbook.ito',
    VALUABLES: 'com.maskbook.tweet',
    POLL: 'com.maskbook.poll',
    PETS: 'com.maskbook.pets',
    MASK_BOX: 'com.maskbook.box',
    POOL_TOGETHER: 'com.pooltogether',
    GOOD_GHOSTING: 'co.good_ghosting',
}

type TUTORIAL_URLS_OPT = {
    [key: string]: string
}

export const TUTORIAL_URLS_EN: TUTORIAL_URLS_OPT = {
    [PLUGIN_IDS.FILE_SERVICE]:
        'https://realmasknetwork.notion.site/Use-File-Service-via-Arweave-IPFS-SIA-Swarm-soon-8c8fe1efce5a48b49739a38f4ea8c60f',
    [PLUGIN_IDS.GITCOIN]:
        'https://realmasknetwork.notion.site/Make-a-quick-Gitcoin-Grant-donation-98ed83784ed4446a8a13fa685c7bddfb',
    [PLUGIN_IDS.DHEDGE]:
        'https://realmasknetwork.notion.site/Invest-in-your-favourite-fund-manager-via-dHEDGE-on-Twitter-ETH-and-Polygon-b00ff2e626949279c83b59ed9207b9a',
    [PLUGIN_IDS.RED_PACKET]:
        'https://realmasknetwork.notion.site/Gift-token-NFTs-to-your-friends-Support-ETH-BSC-and-Polygon-0a71fd421aae4563bd07caa3e2129e5b',
    [PLUGIN_IDS.TRANSAK]: 'https://transak.com/',
    [PLUGIN_IDS.COLLECTIBLES]:
        'https://realmasknetwork.notion.site/Purchase-or-bid-for-NFTs-via-OpenSea-or-Rarible-on-Twitter-c388746f11774ecfa17914c900d3ed97',
    [PLUGIN_IDS.SWAP]:
        'https://realmasknetwork.notion.site/Trade-cryptos-on-Twitter-via-Uniswap-Sushi-0x-Support-ETH-BSC-Polygon-Arbitrum-f2e7d081ee38487ca1db958393ac1edc',
    [PLUGIN_IDS.SNAPSHOT]: 'https://realmasknetwork.notion.site/Cast-a-Snapshot-vote-10c08ed9629942dd852d9afbfab61208',
    [PLUGIN_IDS.MARKETS]:
        'https://realmasknetwork.notion.site/Launch-an-ITO-Initial-Twitter-Offering-Support-ETH-BSC-Polygon-Arbitrum-d84c60903f974f4880d2085a13906d55',
    [PLUGIN_IDS.VALUABLES]:
        'https://realmasknetwork.notion.site/See-the-latest-offer-of-a-Tweet-NFT-by-Valuables-Plugin-27424923ee454a4a9b0ed16fc5cb93d0',
    [PLUGIN_IDS.POOL_TOGETHER]:
        'https://realmasknetwork.notion.site/Participate-in-lossless-lottery-via-PoolTogether-on-Twitter-ETH-and-Polygon-377597e14aff441ab645ecba5ea690f1',
    [PLUGIN_IDS.PETS]: 'https://twitter.com/mintteamnft?s=21',
    [PLUGIN_IDS.GOOD_GHOSTING]:
        'https://realmasknetwork.notion.site/Cultivate-a-weekly-saving-habit-via-GoodGhosting-on-Twitter-Polygon-only-f94aa38b01404b9c99c7a03935840962',
    [PLUGIN_IDS.MASK_BOX]: 'https://box-beta.mask.io/#/',
}

export const TUTORIAL_URLS_CN: TUTORIAL_URLS_OPT = {
    [PLUGIN_IDS.FILE_SERVICE]:
        'https://realmaskbook.notion.site/Arweave-IPFS-SIA-Swarm-62d7d921630645b8b0a8f849f7c89e43',
    [PLUGIN_IDS.GITCOIN]:
        'https://realmaskbook.notion.site/Mask-Twitter-Gitcoin-Grant-a6a8510ce7d8427399b97b95ed01eebe',
    [PLUGIN_IDS.DHEDGE]: 'https://realmaskbook.notion.site/dHEDGE-ETH-Polygon-a7640833342c4d3e85da105c3eab5338',
    [PLUGIN_IDS.RED_PACKET]:
        'https://realmaskbook.notion.site/Red-Packet-ETH-BSC-Polygon-23dfa6535c344fbdb31002d54704889d',
    [PLUGIN_IDS.TRANSAK]: 'https://transak.com/',
    [PLUGIN_IDS.COLLECTIBLES]:
        'https://realmaskbook.notion.site/Opensea-Rarible-NFT-NFT-8d824aaa7e3642ecb03b3371034ca780',
    [PLUGIN_IDS.SWAP]:
        'https://realmaskbook.notion.site/Uniswap-Sushi-0x-ETH-BSC-Polygon-b1c132f0ce954e1ab7b6c1f6ea59de3a',
    [PLUGIN_IDS.SNAPSHOT]: 'https://realmaskbook.notion.site/Snapshot-639b65028903421a96060e7e47598313',
    [PLUGIN_IDS.MARKETS]: 'https://realmaskbook.notion.site/ITO-ETH-BSC-Polygon-f6ec4ed424fe4884a53e254234a14f8e',
    [PLUGIN_IDS.VALUABLES]: 'https://realmaskbook.notion.site/Mask-Valuables-NFT-fb0654509984448295e71aab90221d2c',
    [PLUGIN_IDS.POLL]: '',
    [PLUGIN_IDS.PETS]: '',
}
