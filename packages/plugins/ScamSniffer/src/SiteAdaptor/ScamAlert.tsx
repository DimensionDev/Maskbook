import urlcat from 'urlcat'
import { useState, useEffect, useCallback } from 'react'
import { useAsync } from 'react-use'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Checkbox, Typography, FormControlLabel, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { Twitter as TwitterIcon, Link as LinkIcon, Description as DescriptionIcon } from '@mui/icons-material'
import { openWindow } from '@masknet/shared-base-ui'
import type { ScamResult } from '@scamsniffer/detector'
import { PluginScamRPC } from '../messages.js'
import { twitterDomainMigrate } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        padding: theme.spacing(2),
    },
    list: {
        padding: 0,
        borderTop: '1px solid rgb(109 157 231 / 15%)',
        borderBottom: '1px solid rgb(109 157 231 / 15%)',
    },
    scam: {
        padding: theme.spacing(2),
        background: MaskColorVar.infoBackground,
        borderRadius: '10px',
    },
    reportWrapper: {
        marginTop: '5px',
    },
    report: {
        '& span': { fontSize: 13, color: '#888', lineHeight: 1.75 },
    },
    listIcon: {
        width: '24px',
        height: '24px',
    },
    desc: {
        margin: '15px 0 7px',
        color: '#777',
        fontSize: '14px',
        textAlign: 'center',
    },
    highlight: {
        color: '#333',
    },
    title: {
        fontFamily: 'Poppins',
        fontWeight: 800,
        margin: '10px 0 18px 0',
        fontSize: '17px',
        lineHeight: '17px',
        width: '350px',
        textAlign: 'center',
        wordBreak: 'break-word',
        color: MaskColorVar.redMain,
    },
}))

function ScamAlert({ result }: { result: ScamResult }) {
    const { classes } = useStyles()
    const [autoReport, setAutoReport] = useState(false)

    useEffect(() => {
        if (autoReport) {
            PluginScamRPC.sendReportScam(result)
        }
    }, [autoReport, result])

    const handleClick = useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setAutoReport(checked)
        PluginScamRPC.enableAutoReport(checked)
    }, [])

    const openTwitter = () => {
        const link = twitterDomainMigrate(urlcat('https://x.com', '/:username', { username: result.twitterUsername }))
        openWindow(link)
    }

    const openSite = () => {
        openWindow(result.externalUrl)
    }

    useAsync(async () => {
        const enabled = await PluginScamRPC.isAutoReportEnabled()
        setAutoReport(enabled)
    }, [])
    return (
        <div className={classes.root}>
            <div className={classes.scam}>
                <Typography variant="body2" className={classes.title}>
                    <Trans>Similar Project</Trans>
                </Typography>
                <List className={classes.list}>
                    <ListItemButton>
                        <ListItemIcon className={classes.listIcon}>
                            <DescriptionIcon className={classes.highlight} />
                        </ListItemIcon>
                        <ListItemText className={classes.highlight} primary={result.name} />
                    </ListItemButton>
                    {result.twitterUsername ?
                        <ListItemButton onClick={() => openTwitter()}>
                            <ListItemIcon className={classes.listIcon}>
                                <TwitterIcon className={classes.highlight} />
                            </ListItemIcon>
                            <ListItemText className={classes.highlight} primary={result.twitterUsername} />
                        </ListItemButton>
                    :   null}
                    {result.externalUrl ?
                        <ListItemButton onClick={() => openSite()}>
                            <ListItemIcon className={classes.listIcon}>
                                <LinkIcon className={classes.highlight} />
                            </ListItemIcon>
                            <ListItemText className={classes.highlight} primary={result.externalUrl} />
                        </ListItemButton>
                    :   null}
                </List>
                <Typography className={classes.desc}>
                    <Trans>Be careful what you visit and sign!</Trans>
                </Typography>
            </div>
            <div className={classes.reportWrapper}>
                <FormControlLabel
                    className={classes.report}
                    control={<Checkbox checked={autoReport} onChange={handleClick} />}
                    label={<Trans>Auto report the scam links to MetaMask</Trans>}
                />
            </div>
        </div>
    )
}

export default ScamAlert
