import { PluginId } from '@masknet/plugin-infra'
import {
    CBridgeIcon,
    ArbitrumOneBridgeIcon,
    BobaBridgeIcon,
    PolygonBridgeIcon,
    RainbowBridgeIcon,
} from './SNSAdaptor/MaskIcon'

export const PLUGIN_ID = PluginId.CrossChainBridge
export const PLUGIN_DESCRIPTION = 'A cross-chain-bridge plugin'
export const PLUGIN_NAME = 'CrossChainBridge'
export function getCrossChainBridge(t: Record<string, () => string>) {
    return [
        {
            name: 'CBridge',
            intro: t.cbridge_intro(),
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
            intro: t.rainbow_bridge_intro(),
            icon: <RainbowBridgeIcon />,
            link: 'https://rainbowbridge.app/transfer',
        },
    ]
}
