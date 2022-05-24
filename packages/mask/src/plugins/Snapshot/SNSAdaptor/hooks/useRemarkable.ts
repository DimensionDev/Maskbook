import { useMemo } from 'react'
import { Remarkable } from 'remarkable'
import { resolveIPFSLinkFromURL } from '@masknet/web3-shared-evm'

export function useRemarkable(md: string) {
    return useMemo(() => {
        const remarkable = new Remarkable()
        const defaultImageRender = remarkable.renderer.rules.image
        remarkable.use(() => {
            remarkable.renderer.rules.image = function (_tokens: Remarkable.ImageToken[], idx: number, ...args: []) {
                const tokens = _tokens.map((token) => ({
                    ...token,
                    src: resolveIPFSLinkFromURL(token.src),
                }))
                return defaultImageRender(tokens, idx, ...args)
            }
        })
        return remarkable.render(md)
    }, [md])
}
