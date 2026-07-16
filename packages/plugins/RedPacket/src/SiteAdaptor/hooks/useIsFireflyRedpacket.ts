import { usePostInfoRootNode } from '@masknet/plugin-infra/content-script'

export function useIsFireflyRedpacket() {
    const raw = usePostInfoRootNode()?.textContent

    return raw?.includes('#FireflyLuckyDrop') || false
}
