import { makeStyles } from '@masknet/theme'
import { isSameAddress, useChainId } from '@masknet/web3-shared-evm'
import { Card, CardContent, CardActions, Tabs, Tab, Typography, Link, Paper } from '@material-ui/core'
import { useState } from 'react'
import { FurucomboIcon } from '../../../resources/FurucomboIcon'
import { MaskTextIcon } from '../../../resources/MaskIcon'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useFetchPools } from '../hooks/usePool'
import type { Investable } from '../types'
import { InvestmentsView } from './InvestmentsView'
import { PoolView } from './PoolView'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '0 !important',
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        backgroundColor: `#1b1b21`,
    },
    tab: {
        fontFamily: 'inherit',
        color: 'white',
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
    maskbook: {
        width: 40,
        height: 10,
    },
    furucombo: {
        height: 16,
        margin: theme.spacing(-0.5, 0.25),
    },
}))

interface PoolViewProps {
    address: string
    category: string
}

export function FurucomboView(props: PoolViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [tabIndex, setTabIndex] = useState(0)
    const currentChainId = useChainId()

    const { value, loading, error } = useFetchPools()

    if (loading) return <Typography align="center">Loading...</Typography>

    if (error || !value)
        return (
            <Typography align="center" color="textPrimary">
                {t('plugin_furucombo_smt_wrong')}
            </Typography>
        )

    const { investables = [] } = value

    const investable = investables.find(
        (investable: Investable) =>
            isSameAddress(investable.token.address, props.address) &&
            investable.chainId === currentChainId &&
            investable.category === props.category,
    )

    if (!investable)
        return (
            <Typography align="center" color="textPrimary">
                {t('plugin_furucombo_pool_not_found')}
            </Typography>
        )

    return (
        <Card className={classes.root}>
            <CardContent className={classes.content}>
                <Tabs
                    value={tabIndex}
                    className={classes.tabs}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="secondary"
                    onChange={(event: React.SyntheticEvent, newValue: number) => setTabIndex(newValue)}>
                    <Tab value={0} className={classes.tab} key={0} label={t('plugin_furucombo_tab_pool')} />,
                    <Tab value={1} className={classes.tab} key={1} label={t('plugin_furucombo_tab_investments')} />,
                </Tabs>
                <Paper>
                    {tabIndex === 0 ? <PoolView investable={investable} /> : null}
                    {tabIndex === 1 ? <InvestmentsView investables={investables} /> : null}
                </Paper>
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
                        <MaskTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
                    </Link>
                </Typography>
                <Typography className={classes.footnote} variant="subtitle2">
                    <span>Supported by</span>
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        color="textSecondary"
                        rel="noopener noreferrer"
                        title="Furucombo"
                        href="https://furucombo.app">
                        <FurucomboIcon className={classes.furucombo} />
                        Furucombo
                    </Link>
                </Typography>
            </CardActions>
        </Card>
    )
}
