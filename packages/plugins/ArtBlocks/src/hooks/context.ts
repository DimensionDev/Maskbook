import { usePostLink } from '@masknet/plugin-infra/content-script'
import { createContainer } from 'unstated-next'

function usePostUrl(initState?: { postUrl?: string }) {
    const postUrl = usePostLink().toString
    return { postUrl: initState?.postUrl || postUrl }
}

export const ArtBlocksContainer = createContainer(usePostUrl)

ArtBlocksContainer.Provider.displayName = 'ArtBlocksContainer.Provider'
