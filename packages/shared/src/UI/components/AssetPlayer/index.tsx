import { memo } from 'react'
import IframeResizer from 'iframe-resizer-react'
import urlcat from 'urlcat'

interface AssetPlayerProps {
    url: string
}
const mediaViewerUrl = 'https://dimensiondev.github.io/Media-Viewer/index.html'

export const AssetPlayer = memo<AssetPlayerProps>(({ url }) => {
    return <IframeResizer log src={urlcat(mediaViewerUrl, { url })} />
})
