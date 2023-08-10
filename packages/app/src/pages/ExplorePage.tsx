import { useMemo } from 'react'
import { PostInfoContext } from '@masknet/plugin-infra/content-script'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { createPostInfoContext } from '../helpers/createPostInfoContext.js'
import { DecryptMessage } from '../main/index.js'
import { DashboardBody } from '../components/DashboardBody.js'

export interface ExplorePageProps {}

export default function ExplorePage(props: ExplorePageProps) {
    const context = useMemo(() => createPostInfoContext(), [])

    return (
        <PostInfoContext.Provider value={context}>
            <DashboardContainer>
                <main id="explore">
                    <DashboardHeader title="Encrypted Post" />
                    <DashboardBody>
                        <DecryptMessage />
                    </DashboardBody>
                </main>
            </DashboardContainer>
        </PostInfoContext.Provider>
    )
}
