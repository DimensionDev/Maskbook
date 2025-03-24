import { Trans } from '@lingui/react/macro'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, Tab, Typography } from '@mui/material'
import { memo, useMemo, useRef } from 'react'
import { CloudBackupFormContext } from '../../../contexts/CloudBackupFormContext.js'
import { CloudBackup } from './CloudBackup/index.js'
import { LocalBackup } from './LocalBackup.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    description: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        marginTop: theme.spacing(1.5),
    },
    tabContainer: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: theme.spacing(3),
        borderRadius: theme.spacing(1, 1, 0, 0),
        overflow: 'hidden',
    },
    tabList: {
        background:
            theme.palette.mode === 'light' ?
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
            :   'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%)',
        padding: theme.spacing('14px', 2, 0),
    },
    tab: {
        fontSize: 16,
        fontWeight: 700,
    },
    panels: {
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        width: '100%',
    },
    panelContainer: {
        padding: theme.spacing(2),
    },
    exclaveActions: {
        marginTop: 136,
    },
}))

const Backup = memo(function Backup() {
    const { classes } = useStyles()
    const tabPanelClasses = useMemo(() => ({ root: classes.panels }), [classes.panels])

    const [currentTab, onChange, tabs] = useTabs('cloud', 'local')

    const { formState } = CloudBackupFormContext.useContainer()
    const portalContainerRef = useRef<HTMLDivElement>(null)

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
                <TabContext value={currentTab}>
                    <div className={classes.tabList}>
                        <MaskTabList
                            variant="base"
                            onChange={(_, value) => {
                                onChange(_, value)
                                formState.reset()
                            }}
                            aria-label="Cloud Backup Methods">
                            <Tab className={classes.tab} label={<Trans>Locale Backup</Trans>} value={tabs.local} />
                            <Tab className={classes.tab} label={<Trans>Cloud Backup</Trans>} value={tabs.cloud} />
                        </MaskTabList>
                    </div>
                    <div className={classes.panelContainer}>
                        <TabPanel value={tabs.local} classes={tabPanelClasses}>
                            <LocalBackup portalContainerRef={portalContainerRef} />
                        </TabPanel>
                        <TabPanel value={tabs.cloud} classes={tabPanelClasses}>
                            <CloudBackup portalContainerRef={portalContainerRef} />
                        </TabPanel>
                    </div>
                </TabContext>
            </Box>
            <Box className={classes.exclaveActions} ref={portalContainerRef}></Box>
        </Box>
    )
})

export const Component = memo(function BackupPage() {
    return (
        <CloudBackupFormContext>
            <Backup />
        </CloudBackupFormContext>
    )
})
