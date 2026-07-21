import { Trans } from '@lingui/react/macro'
import { MaskTabList, makeStyles } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Box, Tab, Typography } from '@mui/material'
import { memo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { StorageType } from '../types.js'
import { usePathTab, type TabPathTuple } from '@masknet/shared'
import { DashboardRoutes } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    description: {
        color: theme.vars.palette.maskColor.second,
        fontSize: 14,
        marginTop: theme.spacing(1.5),
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
        marginTop: 136,
    },
}))

const tuples: TabPathTuple[] = [
    [StorageType.Local, DashboardRoutes.BackupLocal],
    [
        StorageType.Cloud,
        DashboardRoutes.BackupCloud,
        DashboardRoutes.BackupCloudGoogleDrive,
        (pathname) => (pathname.startsWith(DashboardRoutes.BackupCloud) ? DashboardRoutes.BackupCloud : undefined),
    ],
]

export const Component = memo(function Backup() {
    const { classes } = useStyles()

    const [tab, handleTabChange] = usePathTab(tuples)

    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null)

    return (
        <Box>
            <Typography variant="h1" className={classes.title}>
                <Trans>Back Up Your Data Your Way</Trans>
            </Typography>
            <Typography className={classes.description}>
                <Trans>
                    Choose from multiple backup options, now including encrypted storage via your authorized Google
                    Drive for added security and flexibility.
                </Trans>
            </Typography>
            <Box className={classes.tabContainer}>
                <div className={classes.tabList}>
                    <TabContext value={tab}>
                        <MaskTabList variant="base" onChange={handleTabChange} aria-label="Cloud Backup Methods">
                            <Tab
                                className={classes.tab}
                                label={<Trans>Locale Backup</Trans>}
                                value={StorageType.Local}
                            />
                            <Tab
                                className={classes.tab}
                                label={<Trans>Cloud Backup</Trans>}
                                value={StorageType.Cloud}
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
