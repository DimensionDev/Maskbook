import { ApplicationBoardForm } from '@masknet/shared'
import { PageContainer } from '../components/PageContainer.js'

interface ApplicationsPageProps {}

export default function ApplicationsPage(props: ApplicationsPageProps) {
    return (
        <PageContainer title="Applications">
            <ApplicationBoardForm
                queryOwnedPersonaInformation={async () => []}
                allPersonas={[]}
                personaPerSiteConnectStatusLoading={false}
            />
        </PageContainer>
    )
}
