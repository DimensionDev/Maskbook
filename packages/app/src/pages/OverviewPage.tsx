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
                    <div className="bg-white p-5">
                        <div className="border pt-3 rounded-lg">
                            <h2>Assets</h2>
                        </div>
                    </div>
                ) : (
                    <div>Please connect a wallet.</div>
                )}
            </main>
        </DashboardContainer>
    )
}
