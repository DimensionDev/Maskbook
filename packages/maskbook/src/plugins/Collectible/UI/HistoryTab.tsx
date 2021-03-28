import { makeStyles, createStyles, Typography } from '@material-ui/core'
import { CollectibleTab } from './CollectibleTab'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            width: '100%',
            height: '100%',
        },
        content: {},
    })
})

export interface HistoryTabProps {}

export function HistoryTab(props: HistoryTabProps) {
    const classes = useStyles()

    return (
        <CollectibleTab>
            <Typography>This is the history tab.</Typography>
        </CollectibleTab>
    )
}
