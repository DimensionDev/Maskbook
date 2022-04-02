interface IconProps {
    size: string
}
export function ArbitrumOneBridgeIcon({ size = 36 }) {
    return (
        <img
            style={{ alignSelf: 'center' }}
            width={size}
            height={size}
            src={new URL('./assets/arbitrum-one-bridge.png', import.meta.url).toString()}
        />
    )
}
export function BobaBridgeIcon({ size = 36 }) {
    return (
        <img
            style={{ alignSelf: 'center' }}
            width={size}
            height={size}
            src={new URL('./assets/boba-bridge.png', import.meta.url).toString()}
        />
    )
}
export function CBridgeIcon({ size = 36 }) {
    return (
        <img
            style={{ alignSelf: 'center' }}
            width={size}
            height={size}
            src={new URL('./assets/cbridge.png', import.meta.url).toString()}
        />
    )
}
export function PolygonBridgeIcon({ size = 36 }) {
    return (
        <img
            style={{ alignSelf: 'center' }}
            width={size}
            height={size}
            src={new URL('./assets/polygon-bridge.png', import.meta.url).toString()}
        />
    )
}
export function RainbowBridgeIcon({ size = 36 }) {
    return (
        <img
            style={{ alignSelf: 'center' }}
            width={size}
            height={size}
            src={new URL('./assets/rainbow-bridge.png', import.meta.url).toString()}
        />
    )
}
