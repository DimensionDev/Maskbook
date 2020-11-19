import React from 'react'
import { map } from 'lodash-es'
import { QRCode } from '../../../../components/shared/qrcode'

export const PlatformSelector: React.FC<{ uri: string }> = ({ uri }) => {
    if (uri === '') {
        return null
    } else if (process.env.architecture === 'app' && process.env.target === 'firefox') {
        // Android only
        const onConnect = () => {
            open(uri)
        }
        return <button onClick={onConnect}>Connect</button>
    } else if (process.env.architecture === 'app' && process.env.target === 'safari') {
        // iOS only
        const universalLinks = {
            Rainbow: 'https://rnbwapp.com/wc',
            MetaMask: 'https://metamask.app.link/wc',
            Trust: 'https://link.trustwallet.com/wc',
            imToken: 'imtokenv2://wc',
        }
        const makeConnect = (link: string) => () => {
            const url = new URL(link)
            url.searchParams.set('uri', uri)
            open(url.toString())
        }
        return (
            <>
                {map(universalLinks, (link, name) => (
                    <button onClick={makeConnect(link)}>{name}</button>
                ))}
            </>
        )
    }
    const style = { width: 400, height: 400, display: 'block', margin: 'auto' }
    return <QRCode text={uri} options={{ width: 400 }} canvasProps={{ style }} />
}
