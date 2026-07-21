import { Trans } from '@lingui/react/macro'
import { usePathTab, type TabPathTuple } from '@masknet/shared'
import { DashboardRoutes } from '@masknet/shared-base'
import { MaskTabList, makeStyles } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Box, Tab, Typography } from '@mui/material'
import { memo, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { RecoveryMethod } from './types.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    header: {
        display: 'flex',
        gap: theme.spacing(1.5),
    },
    texts: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        marginRight: 'auto',
    },
    setup: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.vars.palette.maskColor.main,
        fontWeight: 700,
        textDecoration: 'none',
    },
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    description: {
        color: theme.vars.palette.maskColor.second,
        fontSize: 14,
    },
    tabContainer: {
        border: `1px solid ${theme.vars.palette.maskColor.line}`,
        marginTop: theme.spacing(3),
        borderRadius: theme.spacing(1, 1, 0, 0),
        overflow: 'hidden',
    },
    tabList: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)',
        ...theme.applyStyles('dark', {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%)',
        }),
        padding: theme.spacing('14px', 2, 0),
    },
    tab: {
        fontSize: 16,
        fontWeight: 700,
    },
    panelContainer: {
        padding: theme.spacing(2),
    },
    exclaveActions: {
        marginTop: 'auto',
    },
}))

const tuples: TabPathTuple[] = [
    [RecoveryMethod.Phrase, DashboardRoutes.RecoveryPhrase],
    [RecoveryMethod.PrivateKey, DashboardRoutes.RecoveryPrivateKey],
    [RecoveryMethod.Local, DashboardRoutes.RecoveryLocal],
    [
        RecoveryMethod.Cloud,
        DashboardRoutes.RecoveryCloudGoogleDrive,
        (pathname) => (pathname.startsWith(DashboardRoutes.RecoveryCloud) ? DashboardRoutes.RecoveryCloud : undefined),
    ],
]

export const Component = memo(function Recovery() {
    const { classes } = useStyles()

    const [tab, handleTabChange] = usePathTab(tuples)

    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null)

    return (
        <Box className={classes.container}>
            <Box className={classes.header}>
                <div className={classes.texts}>
                    <Typography variant="h1" className={classes.title}>
                        <Trans>Recover your data</Trans>
                    </Typography>
                    <Typography className={classes.description}>
                        <Trans>Please select the appropriate method to restore your personal data.</Trans>
                    </Typography>
                </div>
                <Typography className={classes.setup} component={Link} to={DashboardRoutes.SignUpPersona}>
                    <Trans>Create Persona</Trans>
                </Typography>
            </Box>
            <Box className={classes.tabContainer}>
                <div className={classes.tabList}>
                    <TabContext value={tab}>
                        <MaskTabList variant="base" onChange={handleTabChange} aria-label="Cloud Backup Methods">
                            <Tab
                                className={classes.tab}
                                label={<Trans>Recovery Phrase</Trans>}
                                value={RecoveryMethod.Phrase}
                            />
                            <Tab
                                className={classes.tab}
                                label={<Trans>Private Key</Trans>}
                                value={RecoveryMethod.PrivateKey}
                            />
                            <Tab
                                className={classes.tab}
                                label={<Trans>Local Backup</Trans>}
                                value={RecoveryMethod.Local}
                            />
                            <Tab
                                className={classes.tab}
                                label={<Trans>Cloud Backup</Trans>}
                                value={RecoveryMethod.Cloud}
                            />
                        </MaskTabList>
                    </TabContext>
                </div>
                <div className={classes.panelContainer}>
                    <Outlet context={{ portalContainer }} />
                </div>
            </Box>
            <div className={classes.exclaveActions} ref={setPortalContainer} />
        </Box>
    )
})
