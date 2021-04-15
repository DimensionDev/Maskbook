import { ResultCard } from './ResultCard'
import { VotesCard } from './VotesCard'
import { NetworkFail } from './NetworkFail'
import { InformationCard } from './InformationCard'
import { SnapshotTab } from './SnapshotTab'
import { useI18N } from '../../../utils/i18n-next-ui'

export function ProgressTab(props: { retry: () => void }) {
    const { t } = useI18N()

    return (
        <SnapshotTab>
            <InformationCard />
            <NetworkFail title={t('plugin_snapshot_result_title')} retry={props.retry}>
                <ResultCard />
            </NetworkFail>
            <NetworkFail title={t('plugin_snapshot_votes_title')} retry={props.retry}>
                <VotesCard />
            </NetworkFail>
        </SnapshotTab>
    )
}
