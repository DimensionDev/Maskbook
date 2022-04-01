import { PluginId } from '@masknet/plugin-infra'
import React from 'react'
import {
    CBridgeIcon,
    ArbitrumOneBridgeIcon,
    BobaBridgeIcon,
    PolygonBridgeIcon,
    RainbowBridgeIcon,
} from './SNSAdaptor/MaskIcon'
export const PLUGIN_ID = PluginId.CrossChainBridge
export const PLUGIN_DESCRIPTION = 'An example plugin of Mask Network.'
export const PLUGIN_NAME = 'Example'

export const CROSS_CHAIN_BRIDGE = [
    {
        name: 'CBridge',
        intro: 'Powered by Celer Network. Support $Mask!',
        icon: <CBridgeIcon />,
        isOfficial: false,
        link: 'https://cbridge.celer.network/#/transfer',
    },
    {
        name: 'Arbitrum One Bridge',
        isOfficial: true,
        icon: <ArbitrumOneBridgeIcon />,
        link: 'https://bridge.arbitrum.io/',
    },
    {
        name: 'BOBA Bridge',
        isOfficial: true,
        icon: <BobaBridgeIcon />,
        link: 'https://gateway.boba.network/',
    },
    {
        name: 'Polygon Bridge',
        isOfficial: true,
        icon: <PolygonBridgeIcon />,
        link: 'https://wallet.polygon.technology/bridge/',
    },
    {
        name: 'Rainbow Bridge',
        isOfficial: true,
        intro: 'Bridge between or send within Ethereum, NEAR and Aurora! ',
        icon: <RainbowBridgeIcon />,
        link: 'https://rainbowbridge.app/transfer',
    },
]
