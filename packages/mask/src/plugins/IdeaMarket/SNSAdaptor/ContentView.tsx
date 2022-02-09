import { useRef } from 'react'
import { IdeaToken, MarketAvailable } from '../types'

interface StatsViewProps {
    ideaToken: IdeaToken
}

export function ContentView(props: StatsViewProps) {
    const { ideaToken } = props
    const gridIframe = useRef(null)

    function handleIframe() {
        const iframeItem = gridIframe?.current
        // const anchors = iframeItem?.contentWindow.getElementsByTagName('a')
        console.log('iframeItem: ', iframeItem)
    }

    return (
        <div>
            {ideaToken.market.name === MarketAvailable.Wikipedia ? (
                <iframe
                    ref={gridIframe}
                    src="https://fr.wikipedia.org/wiki/Marie_Dauguet"
                    seamless
                    frameBorder="0"
                    width="100%"
                    height="500px"
                    onLoad={handleIframe}
                />
            ) : null}
            {ideaToken.market.name === MarketAvailable.Twitter ? (
                <>
                    <h2>Last tweets</h2>
                    <a className="twitter-timeline" href="https://twitter.com/TwitterDev?ref_src=twsrc%5Etfw">
                        Tweets by TwitterDev
                    </a>{' '}
                    <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8" />
                </>
            ) : null}
        </div>
    )
}
