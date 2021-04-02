import { Card, createStyles, makeStyles, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotCard } from './SnapshotCard'

export interface InformationCardProps {}

const useStyles = makeStyles((theme) => {
    return createStyles({})
})

export function InformationCard(props: InformationCardProps) {
    const { t } = useI18N()
    const classes = useStyles()

    return (
        <SnapshotCard title="Information">
            <Typography>This is information card.</Typography>
        </SnapshotCard>
    )
}
