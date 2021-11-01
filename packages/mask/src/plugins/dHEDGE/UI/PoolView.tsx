import { RefreshIcon } from '@masknet/icons'
import { useChainId } from '@masknet/web3-shared-evm'
import { Card, CardActions, CardContent, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import React from 'react'
import { MaskTextIcon } from '../../../resources/MaskIcon'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useFetchPool, usePoolDepositAssets } from '../hooks/usePool'
import { PoolViewDesk } from './PoolViewDesk'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    message: {
        textAlign: 'center',
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 'inherit',
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 !important',
    },
    body: {
        flex: 1,
        overflow: 'auto',
        maxHeight: 350,
        borderRadius: 0,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        width: '100%',
        minHeight: 'unset',
    },
    tab: {
        minHeight: 'unset',
        minWidth: 'unset',
    },
    footer: {
        marginTop: -1, // merge duplicate borders
        zIndex: 1,
        position: 'relative',
        borderTop: `solid 1px ${theme.palette.divider}`,
        justifyContent: 'space-between',
    },
    footnote: {
        fontSize: 10,
        marginRight: theme.spacing(1),
    },
    footLink: {
        cursor: 'pointer',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
    },
    footMenu: {
        color: theme.palette.text.secondary,
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
    },
    footName: {
        marginLeft: theme.spacing(0.5),
    },
    mask: {
        width: 40,
        height: 10,
    },
    dhedge: {
        height: 10,
        margin: theme.spacing(0, 0.5),
    },

    view: {
        borderRadius: 0,
    },
}))

interface PoolViewProps {
    address?: string
    link: string
}

export function PoolView(props: PoolViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const currentChainId = useChainId()

    //#region allowed tokens
    const { value: pool, error, loading, retry } = useFetchPool(props.address ?? '')

    //#region susd token
    const {
        value: allowedTokens,
        loading: loadingAllowedTokens,
        retry: retryAllowedTokens,
        error: errorAllowedTokens,
    } = usePoolDepositAssets(pool)
    //#endregion

    if (loading || loadingAllowedTokens)
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_dhedge_loading')}
            </Typography>
        )
    if (!pool)
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_dhedge_pool_not_found')}
            </Typography>
        )
    if (error || (errorAllowedTokens && currentChainId === pool.chainId))
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_dhedge_smt_wrong')}
                <br />
                {error?.message || errorAllowedTokens?.message}
                <br />
                <RefreshIcon className={classes.refresh} color="primary" onClick={error ? retry : retryAllowedTokens} />
            </Typography>
        )

    return (
        <Card className={classes.root} elevation={0}>
            <CardContent className={classes.content}>
                <PoolViewDesk classes={{ root: classes.view }} pool={pool} tokens={allowedTokens} link={props.link} />
            </CardContent>
            <CardActions className={classes.footer}>
                <Typography className={classes.footnote} variant="subtitle2">
                    <span>{t('plugin_powered_by')} </span>
                    <Link
                        className={classes.footLink}
                        color="textSecondary"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Mask"
                        href="https://mask.io">
                        <MaskTextIcon classes={{ root: classes.mask }} viewBox="0 0 80 20" />
                    </Link>
                </Typography>
                <Typography className={classes.footnote} variant="subtitle2">
                    <span>Supported by</span>
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        color="textSecondary"
                        rel="noopener noreferrer"
                        title="dHEDGE"
                        href="https://dhedge.org">
                        <img className={classes.dhedge} src="https://app.dhedge.org/favicon.ico" />
                        dHEDGE
                    </Link>
                </Typography>
            </CardActions>
        </Card>
    )
}
