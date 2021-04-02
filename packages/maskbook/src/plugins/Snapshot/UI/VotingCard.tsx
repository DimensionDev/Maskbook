import { Card, createStyles, makeStyles, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotCard } from './SnapshotCard'

export interface VotingCardProps {}

const useStyles = makeStyles((theme) => {
    return createStyles({})
})

export function VotingCard(props: VotingCardProps) {
    const { t } = useI18N()
    const classes = useStyles()

    return (
        <SnapshotCard title="Cast a Vote">
            <Typography>This is voting card.</Typography>
        </SnapshotCard>
    )
}
