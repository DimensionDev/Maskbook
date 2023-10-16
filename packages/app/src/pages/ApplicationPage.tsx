import { ApplicationBoardForm } from '@masknet/shared'
import { PageContainer } from '../components/PageContainer.js'

export default function ApplicationsPage() {
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
