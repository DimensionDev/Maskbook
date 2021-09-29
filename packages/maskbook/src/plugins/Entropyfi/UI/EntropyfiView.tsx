import { DarkColor } from '@masknet/theme/constants'
import { Card, CardActions, CardContent, Link, Paper, Tab, Tabs, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import React, { useState } from 'react'
import { MaskbookTextIcon } from '../../../resources/MaskbookIcon'
import { EntropyfiIcon } from '../../../resources/EntropyfiIcon'
import { useI18N } from '../../../utils/i18n-next-ui'
import { PoolsView } from './PoolsView'

const useStyles = makeStyles()((theme) => ({
    root: {
        // width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
        backgroundColor: 'rgba(31, 55, 54, 1)',
        textAlign: 'center',
        backgroundAttachment: 'local',
        backgroundPosition: '0 0',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    },
    message: {
        color: theme.palette.text.primary,
        textAlign: 'center',
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
        fontSize: 'inherit',
    },
    content: {
        // width: '100%',
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
        backgroundColor: 'rgba(31, 55, 54, 1)',
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        width: '100%',
        minHeight: 'unset',
        color: DarkColor.textPrimary,
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
    maskbook: {
        width: 40,
        height: 10,
    },
    entropyfiIcon: {
        height: 15,
        width: 15,
        marginLeft: theme.spacing(0.5),
        marginBottom: theme.spacing(-0.5),
    },
    entropyfiText: {
        fontSize: 10,
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
    },
}))

export function EntropyfiView() {
    const { t } = useI18N()
    const { classes } = useStyles()

    //#region mask pool
    // const { MASK_POOL_ADDRESS, MASK_POOL_SUBGRAPH } = usePoolTogetherConstants()

    //#region tabs
    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab className={classes.tab} key="pools" label="Lossless prediction game" />,
        // <Tab className={classes.tab} key="account" label="account" />,
    ].filter(Boolean)
    // console.log('tabs', tabs)
    //#endregion

    return (
        <Card className={classes.root} elevation={0}>
            {/* <Card className={classes.root} elevation={0} style={{ backgroundImage: `url(${backgroundImage_1})` }}> */}
            <CardContent className={classes.content}>
                <Tabs
                    className={classes.tabs}
                    indicatorColor="primary"
                    textColor="inherit"
                    variant="fullWidth"
                    value={tabIndex}
                    onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                    TabIndicatorProps={{
                        style: {
                            display: 'none',
                        },
                    }}>
                    {tabs}
                </Tabs>
                <Paper className={classes.body}>
                    {tabIndex === 0 ? <PoolsView /> : null}
                    {/* {tabIndex === 1 ? <Account /> : null} */}
                </Paper>
            </CardContent>
            <CardActions className={classes.footer}>
                <Typography color={DarkColor.textSecondary} className={classes.footnote} variant="subtitle2">
                    <span>{t('plugin_powered_by')} </span>
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Mask"
                        href="https://mask.io">
                        <MaskbookTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
                    </Link>
                </Typography>
                <Typography className={classes.footnote} color={DarkColor.textSecondary} variant="subtitle2">
                    <span>Supported by</span>
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Entropyfi"
                        href="https://www.entropyfi.com/"
                        style={{ textDecoration: 'none', color: '#45e7dd' }}>
                        <EntropyfiIcon classes={{ root: classes.entropyfiIcon }} />
                        <span className={classes.entropyfiText}>Entropyfi</span>
                    </Link>
                </Typography>
            </CardActions>
        </Card>
    )
}
