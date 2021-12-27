import { getMaskColor, makeStyles, useStylesExtends } from '@masknet/theme'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
    },
    text: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            color: getMaskColor(theme).textPrimary,
        },
    },
}))

export interface NFTPageProps extends withClasses<'text' | 'button'> {
    address: string
}

export function NFTPage(props: NFTPageProps) {
    const { address } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <div className={classes.root}>
            <CollectionList address={address} />
        </div>
    )
}
