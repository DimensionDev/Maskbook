import { getMaskColor, makeStyles, useStylesExtends } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'
import { useI18N } from '../../../utils'

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
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    if (!address)
        return (
            <div className={classes.root}>
                <Box className={classes.text} display="flex" alignItems="center" justifyContent="center">
                    <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
                </Box>
            </div>
        )

    return (
        <div className={classes.root}>
            <CollectionList address={address} />
        </div>
    )
}
