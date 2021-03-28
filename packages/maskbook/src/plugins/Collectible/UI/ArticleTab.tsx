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

export interface ArticleTabProps {}

export function ArticleTab(props: ArticleTabProps) {
    const classes = useStyles()

    return (
        <CollectibleTab>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
            <Typography>This is the hero tab.</Typography>
        </CollectibleTab>
    )
}
