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

export interface OfferTabProps {}

export function OfferTab(props: OfferTabProps) {
    const classes = useStyles()

    return (
        <CollectibleTab>
            <Typography>This is the offer tab.</Typography>
        </CollectibleTab>
    )
}
