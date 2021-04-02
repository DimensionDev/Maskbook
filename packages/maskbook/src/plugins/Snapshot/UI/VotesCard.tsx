import { Card, createStyles, makeStyles, CardContent, CardHeader, Box, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotCard } from './SnapshotCard'

export interface VotesCardProps {}

const useStyles = makeStyles((theme) => {
    return createStyles({})
})

export function VotesCard(props: VotesCardProps) {
    const { t } = useI18N()
    const classes = useStyles()

    return (
        <SnapshotCard title="Votes">
            <Typography>This is votes card.</Typography>
        </SnapshotCard>
    )
}
