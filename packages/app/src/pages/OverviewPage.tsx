import { useChainContext } from '@masknet/web3-hooks-base'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { StickySearchHeader } from '../components/StickySearchBar.js'

export interface OverviewPageProps {}

export default function OverviewPage(props: OverviewPageProps) {
    const { account } = useChainContext()

    return (
        <DashboardContainer>
            <StickySearchHeader />

            <main>
                <DashboardHeader title="Overview" />

                {account ? (
                    <div className="p-5">
                        <h2>Assets</h2>
                    </div>
                ) : (
                    <div className="p-5">
                        <p>Please connect a wallet.</p>
                    </div>
                )}
            </main>
        </DashboardContainer>
    )
}
