import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { Markdown } from '@masknet/shared'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { useI18N } from '../../../../utils/index.js'

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
    markdownContent: {
        textOverflow: 'ellipsis',
        webkitBoxOrient: 'vertical',
        webkitLineClamp: '3',
        color: theme.palette.maskColor.second,
        '& > p': {
            color: `${theme.palette.maskColor.second} !important`,
        },
        '& a': {
            color: `${theme.palette.maskColor.main} !important`,
        },
    },
}))

export interface DescriptionCardProps {
    asset: Web3Helper.NonFungibleAssetScope<void>
}

export function DescriptionCard(props: DescriptionCardProps) {
    const { asset } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    return (
        <div className={classes.wrapper}>
            <Typography className={classes.title}>{t('plugin_collectible_description_title')}</Typography>
            <div className={classes.content}>
                {asset.metadata?.description ? (
                    <Markdown classes={{ root: classes.markdownContent }} content={asset.metadata?.description} />
                ) : (
                    <Typography className={classes.textContent}>-</Typography>
                )}
            </div>
        </div>
    )
}
