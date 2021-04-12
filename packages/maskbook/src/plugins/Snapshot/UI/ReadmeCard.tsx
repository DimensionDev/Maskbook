import { useContext } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotCard } from './SnapshotCard'
import { Markdown } from './Markdown'
import { useProposal } from '../hooks/useProposal'
import { SnapshotContext } from '../context'

const useStyles = makeStyles((theme) => {
    return createStyles({})
})

export interface ReadMeCardProps {}

export function ReadMeCard(props: ReadMeCardProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const identifier = useContext(SnapshotContext)
    const {
        payload: { message },
    } = useProposal(identifier.id)

    return (
        <SnapshotCard title={t('plugin_snapshot_readme_title')}>
            <Markdown content={message.payload.body} />
        </SnapshotCard>
    )
}
