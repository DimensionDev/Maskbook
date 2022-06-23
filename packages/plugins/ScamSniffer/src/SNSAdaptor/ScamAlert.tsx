import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography, FormControlLabel, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkIcon from '@mui/icons-material/Link'
import Checkbox from '@mui/material/Checkbox'
import DescriptionIcon from '@mui/icons-material/Description'
import type { ScamResult } from '@scamsniffer/detector'
import { PluginScamRPC } from '../messages'
import { useAsync } from 'react-use'
import { useState, useEffect } from 'react'
import { openWindow } from '@masknet/shared-base-ui'
import { useI18N } from '../locales/i18n_generated'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        padding: theme.spacing(2),
    },
    icon: {
        color: MaskColorVar.redMain,
        width: '24px',
        height: '24px',
        verticalAlign: '-6px',
        marginRight: '12px',
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

const ScamAlert = ({ result }: { result: ScamResult }) => {
    const { classes } = useStyles()
    const [autoReport, setAutoReport] = useState(false)
    const t = useI18N()

    useEffect(() => {
        if (autoReport) {
            PluginScamRPC.sendReportScam(result)
        }
    }, [autoReport, result])

    const handleClick = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setAutoReport(checked)
        PluginScamRPC.enableAutoReport(checked)
    }

    const openTwitter = () => {
        const link = urlcat('https://twitter.com', '/:username', { username: result.twitterUsername })
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
                    {t.alertTitle()}
                </Typography>
                <List className={classes.list}>
                    <ListItemButton>
                        <ListItemIcon className={classes.listIcon}>
                            <DescriptionIcon className={classes.highlight} />
                        </ListItemIcon>
                        <ListItemText className={classes.highlight} primary={result.name} />
                    </ListItemButton>
                    {result.twitterUsername ? (
                        <ListItemButton onClick={() => openTwitter()}>
                            <ListItemIcon className={classes.listIcon}>
                                <TwitterIcon className={classes.highlight} />
                            </ListItemIcon>
                            <ListItemText className={classes.highlight} primary={result.twitterUsername} />
                        </ListItemButton>
                    ) : null}
                    {result.externalUrl ? (
                        <ListItemButton onClick={() => openSite()}>
                            <ListItemIcon className={classes.listIcon}>
                                <LinkIcon className={classes.highlight} />
                            </ListItemIcon>
                            <ListItemText className={classes.highlight} primary={result.externalUrl} />
                        </ListItemButton>
                    ) : null}
                </List>
                <Typography className={classes.desc}>{t.tip()}</Typography>
            </div>
            <div className={classes.reportWrapper}>
                <FormControlLabel
                    className={classes.report}
                    control={<Checkbox checked={autoReport} onChange={handleClick} />}
                    label={t.report()}
                />
            </div>
        </div>
    )
}

export default ScamAlert
