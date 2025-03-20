import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'

export function useIsFireflyRedpacket() {
    const raw = usePostInfoDetails.rootNode()?.textContent

    return raw?.includes('#FireflyLuckyDrop') || false
}
