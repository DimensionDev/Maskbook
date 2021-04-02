import { Card, createStyles, makeStyles, CardContent, CardHeader, Box, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotCard } from './SnapshotCard'

export interface ResultCardProps {}

const useStyles = makeStyles((theme) => {
    return createStyles({})
})

export function ResultCard(props: ResultCardProps) {
    const { t } = useI18N()
    const classes = useStyles()

    return (
        <SnapshotCard title="Result">
            <Typography>This is result card.</Typography>
        </SnapshotCard>
    )
}
