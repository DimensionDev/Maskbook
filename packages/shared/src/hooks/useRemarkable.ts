import { useMemo } from 'react'
import { Remarkable } from 'remarkable'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'

export function useRemarkable(md: string) {
    return useMemo(() => {
        const remarkable = new Remarkable()
        const defaultImageRender = remarkable.renderer.rules.image
        remarkable.use(() => {
            remarkable.renderer.rules.image = function (tokens: Remarkable.ImageToken[], idx: number, ...args: []) {
                const modifiedTokens = tokens.map((token) => ({
                    ...token,
                    src: resolveIPFS_URL(token.src)!,
                }))
                return defaultImageRender(modifiedTokens, idx, ...args)
            }
        })
        return remarkable.render(md)
    }, [md])
}
