import { useChainContext } from '@masknet/web3-hooks-base'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { OverviewPage as OverviewPager } from '@masknet/shared'

export interface OverviewPageProps {}

export default function OverviewPage(props: OverviewPageProps) {
    const { account } = useChainContext()

    console.log('--------')
    console.log('account', account)
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Overview" />
                <div className="bg-white p-5">
                    <OverviewPager />
                </div>
            </main>
        </DashboardContainer>
    )
}
