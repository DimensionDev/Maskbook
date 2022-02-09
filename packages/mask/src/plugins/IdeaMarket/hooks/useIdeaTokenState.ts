import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { IdeaTokenTab } from '../types'

function useIdeaTokenState(IdeaToken?: { marketName: string; ideaName: string }) {
    const [tabIndex, setTabIndex] = useState(IdeaTokenTab.STATS)

    return {
        tabIndex,
        setTabIndex,
    }
}

export const IdeaTokenState = createContainer(useIdeaTokenState)
