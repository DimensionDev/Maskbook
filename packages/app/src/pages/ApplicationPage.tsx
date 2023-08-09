import { ApplicationBoardForm } from '@masknet/shared'
import { PageContainer } from '../components/PageContainer.js'

export interface ApplicationsPageProps {}

export default function ApplicationsPage(props: ApplicationsPageProps) {
    return (
        <PageContainer title="Applications">
            <ApplicationBoardForm allPersonas={[]} personaAgainstSNSConnectStatusLoading={false} />
        </PageContainer>
    )
}
