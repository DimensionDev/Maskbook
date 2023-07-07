import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { StickySearchHeader } from '../components/StickySearchBar.js'

export interface SettingsPageProps {}

export default function SettingsPage(props: SettingsPageProps) {
    return (
        <DashboardContainer>
            <StickySearchHeader />

            <main>
                <DashboardHeader title="Settings" />
            </main>
        </DashboardContainer>
    )
}
