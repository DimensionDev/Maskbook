import { DashboardRoutes } from '@masknet/shared-base'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Button, Tab, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { RestoreFromPrivateKey } from '../../../components/Restore/RestoreFromPrivateKey.js'
import { RestoreFromLocal } from '../../../components/Restore/RestoreFromLocal.js'
import { RestoreFromCloud } from '../../../components/Restore/RestoreFromCloud.js'
import { PersonaRecoveryProvider, RecoveryContext } from '../../../contexts/index.js'
import { RestoreFromMnemonic } from '../../../components/Restore/RestoreFromMnemonic.js'

const useStyles = makeStyles()((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    second: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    setup: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    tabContainer: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: theme.spacing(3),
        borderRadius: theme.spacing(1, 1, 0, 0),
        overflow: 'hidden',
    },
    tabList: {
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%)',
        padding: theme.spacing('14px', 2, 0),
    },
    tab: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'Helvetica',
    },
    panels: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        width: '100%',
    },
    panelContainer: {
        padding: theme.spacing(2),
    },
    buttonGroup: {
        display: 'flex',
        columnGap: 12,
    },
}))

export const Recovery = memo(function Recovery() {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const tabPanelClasses = useMemo(() => ({ root: classes.panels }), [classes.panels])
    const navigate = useNavigate()

    const [currentTab, onChange, tabs] = useTabs('mnemonic', 'privateKey', 'local', 'cloud')

    return (
        <Box>
            <Box className={classes.header}>
                <Typography variant="h1" className={classes.title}>
                    {t.data_recovery_title()}
                </Typography>
                <Button
                    variant="text"
                    className={classes.setup}
                    onClick={() => {
                        navigate(DashboardRoutes.SignUpPersona)
                    }}>
                    {t.sign_up()}
                </Button>
            </Box>

            <Typography className={classes.second} mt={2}>
                {t.data_recovery_description()}
            </Typography>
            <PersonaRecoveryProvider>
                <div className={classes.tabContainer}>
                    <TabContext value={currentTab}>
                        <div className={classes.tabList}>
                            <MaskTabList variant="base" onChange={onChange} aria-label="Recovery Methods">
                                <Tab className={classes.tab} label="Identity words" value={tabs.mnemonic} />
                                <Tab className={classes.tab} label="Private Key" value={tabs.privateKey} />
                                <Tab className={classes.tab} label="Local Backup" value={tabs.local} />
                                <Tab className={classes.tab} label="Cloud Backup" value={tabs.cloud} />
                            </MaskTabList>
                        </div>
                        <div className={classes.panelContainer}>
                            <TabPanel value={tabs.mnemonic} classes={tabPanelClasses}>
                                <RestoreFromMnemonic />
                            </TabPanel>
                            <TabPanel value={tabs.privateKey} classes={tabPanelClasses}>
                                <RestoreFromPrivateKey />
                            </TabPanel>
                            <TabPanel value={tabs.local} classes={tabPanelClasses}>
                                <RestoreFromLocal />
                            </TabPanel>
                            <TabPanel value={tabs.cloud} classes={tabPanelClasses}>
                                <RestoreFromCloud />
                            </TabPanel>
                        </div>
                    </TabContext>
                </div>
                <RecoveryContext.Consumer>
                    {({ SubmitOutlet }) => {
                        return (
                            <SetupFrameController>
                                <div className={classes.buttonGroup}>{SubmitOutlet}</div>
                            </SetupFrameController>
                        )
                    }}
                </RecoveryContext.Consumer>
            </PersonaRecoveryProvider>
        </Box>
    )
})
