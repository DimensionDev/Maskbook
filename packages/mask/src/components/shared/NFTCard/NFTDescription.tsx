import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../../utils'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: 12,
    },
    title: {
        fontSize: 20,
        lineHeight: '24px',
        fontWeight: 700,
        marginBottom: 12,
        color: theme.palette.maskColor.main,
    },
    content: {
        width: '100%',
        boxSizing: 'border-box',
        padding: 12,
    },
    textContent: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
}))
interface NFTDescriptionProps {
    asset: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
}

export function NFTDescription(props: NFTDescriptionProps) {
    const { asset } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    return (
        <div className={classes.wrapper}>
            <Typography className={classes.title}>{t('plugin_collectible_description_title')}</Typography>
            <div className={classes.content}>
                <Typography className={classes.textContent}>{asset.metadata?.description ?? '-'}</Typography>
            </div>
        </div>
    )
}
