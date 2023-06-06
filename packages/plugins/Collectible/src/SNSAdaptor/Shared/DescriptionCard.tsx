import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { Markdown } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useI18N } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    root: {
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
        fontSize: 14,
        lineHeight: '18px',
        width: '100%',
        boxSizing: 'border-box',
        padding: 12,
    },
    textContent: {
        color: theme.palette.maskColor.second,
    },
    markdownContent: {
        fontSize: 14,
        textOverflow: 'ellipsis',
        webkitBoxOrient: 'vertical',
        webkitLineClamp: '3',
        color: theme.palette.maskColor.second,
        '& p, & li': {
            fontSize: '14px !important',
            color: `${theme.palette.maskColor.second} !important`,
        },
        '& a': {
            color: `${theme.palette.maskColor.main} !important`,
        },
    },
}))

export interface DescriptionCardProps {
    asset: Web3Helper.NonFungibleAssetScope
}

export function DescriptionCard(props: DescriptionCardProps) {
    const { asset } = props
    const { classes } = useStyles()
    const t = useI18N()
    return (
        <div className={classes.root}>
            <Typography className={classes.title}>{t.plugin_collectible_description_title()}</Typography>
            <div className={classes.content}>
                {asset.metadata?.description ? (
                    <Markdown className={classes.markdownContent}>{asset.metadata.description}</Markdown>
                ) : (
                    <Typography className={classes.textContent}>-</Typography>
                )}
            </div>
        </div>
    )
}
