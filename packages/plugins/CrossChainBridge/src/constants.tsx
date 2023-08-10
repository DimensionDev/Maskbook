import { PluginID } from '@masknet/shared-base'
import {
    CBridgeIcon,
    ArbitrumOneBridgeIcon,
    BobaBridgeIcon,
    PolygonBridgeIcon,
    RainbowBridgeIcon,
} from './SiteAdaptor/MaskIcon.js'

export const PLUGIN_ID = PluginID.CrossChainBridge
export const PLUGIN_DESCRIPTION = 'A cross-chain-bridge plugin'
export const PLUGIN_NAME = 'CrossChainBridge'
export function getCrossChainBridge(t: Record<string, () => string>) {
    return [
        {
            name: 'CBridge',
            ID: `${PLUGIN_ID}_cBridge`,
            intro: t.cbridge_intro(),
            icon: <CBridgeIcon />,
            isOfficial: false,
            link: 'https://cbridge.celer.network/#/transfer',
        },
        {
            name: 'Arbitrum One Bridge',
            ID: `${PLUGIN_ID}_arbitrum_one_bridge`,
            isOfficial: true,
            icon: <ArbitrumOneBridgeIcon />,
            link: 'https://bridge.arbitrum.io/',
        },
        {
            name: 'BOBA Bridge',
            ID: `${PLUGIN_ID}_boba_bridge`,
            isOfficial: true,
            icon: <BobaBridgeIcon />,
            link: 'https://gateway.boba.network/',
        },
        {
            name: 'Polygon Bridge',
            ID: `${PLUGIN_ID}_polygon_bridge`,
            isOfficial: true,
            icon: <PolygonBridgeIcon />,
            link: 'https://wallet.polygon.technology/polygon/bridge/',
        },
        {
            name: 'Rainbow Bridge',
            ID: `${PLUGIN_ID}_rainbow_bridge`,
            isOfficial: true,
            icon: <RainbowBridgeIcon />,
            link: 'https://rainbowbridge.app/transfer',
        },
    ]
}
