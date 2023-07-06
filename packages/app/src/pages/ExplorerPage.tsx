import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { StickySearchHeader } from '../components/StickySearchBar.js'
import { DecryptMessage } from '../main/index.js'

export interface ExplorerPageProps {}

export default function ExplorerPage(props: ExplorerPageProps) {
    return (
        <DashboardContainer>
            <StickySearchHeader />

            <main>
                <DashboardHeader title="Deployments" />

                <div className="bg-white p-5">
                    <DecryptMessage />
                </div>
            </main>
        </DashboardContainer>
    )
}
