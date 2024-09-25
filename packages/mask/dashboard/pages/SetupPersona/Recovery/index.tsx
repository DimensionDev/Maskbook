import { DashboardRoutes } from '@masknet/shared-base'
import type { UseFormSetError } from 'react-hook-form'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Button, Tab, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { memo, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useDashboardTrans } from '../../../locales/i18n_generated.js'
import { RestoreFromPrivateKey, type FormInputs } from '../../../components/Restore/RestoreFromPrivateKey.js'
import { RestorePersonaFromLocal } from '../../../components/Restore/RestorePersonaFromLocal.js'
import { RestoreFromCloud } from '../../../components/Restore/RestoreFromCloud/index.js'
import { RecoveryProvider, RecoveryContext } from '../../../contexts/index.js'
import { RestoreFromMnemonic } from '../../../components/Restore/RestoreFromMnemonic.js'
import Services from '#services'
import { delay } from '@masknet/kit'

import urlcat from 'urlcat'
import { SignUpRoutePath } from '../../SignUp/routePath.js'
import { PersonaContext } from '@masknet/shared'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
        marginBottom: 46,
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

export const Component = memo(function Recovery() {
    const { _ } = useLingui()
    const t = useDashboardTrans()
    const { classes } = useStyles()
    const { currentPersona } = PersonaContext.useContainer()
    const tabPanelClasses = useMemo(() => ({ root: classes.panels }), [classes.panels])
    const navigate = useNavigate()
    const [error, setError] = useState<ReactNode>()

    const [currentTab, onChange, tabs] = useTabs('mnemonic', 'privateKey', 'local', 'cloud')

    const changeCurrentPersona = useCallback(Services.Settings.setCurrentPersonaIdentifier, [])

    const handleRestoreFromMnemonic = useCallback(
        async (values: string[]) => {
            try {
                const persona = await Services.Identity.queryPersonaByMnemonic(values.join(' '), '')
                if (persona) {
                    await changeCurrentPersona(persona)
                    // Waiting persona changed event notify
                    await delay(100)
                    navigate(DashboardRoutes.SignUpPersonaOnboarding, { replace: true })
                } else {
                    navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.PersonaRecovery}`, {
                        replace: false,
                        state: { mnemonic: values },
                    })
                }
            } catch {
                setError(<Trans>Incorrect recovery phrase.</Trans>)
            }
        },
        [t, navigate, changeCurrentPersona],
    )

    const handleRestoreFromPrivateKey = useCallback(
        async (data: FormInputs, onError: UseFormSetError<FormInputs>) => {
            try {
                const persona = await Services.Identity.loginExistPersonaByPrivateKey(data.privateKey)
                if (persona) {
                    await changeCurrentPersona(persona)
                    // Waiting persona changed event notify
                    await delay(100)
                    navigate(DashboardRoutes.SignUpPersonaOnboarding)
                } else {
                    navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.PersonaRecovery}`, {
                        replace: false,
                        state: { privateKey: data.privateKey },
                    })
                }
            } catch {
                onError('privateKey', { type: 'value', message: _(msg`Incorrect Private Key`) })
            }
        },
        [t, navigate],
    )

    const onRestore = useCallback(
        async (count?: number) => {
            if (!currentPersona) {
                const lastedPersona = await Services.Identity.queryLastPersonaCreated()
                if (lastedPersona) {
                    await changeCurrentPersona(lastedPersona)
                    await delay(1000)
                }
            }
            navigate(urlcat(DashboardRoutes.SignUpPersonaOnboarding, { count }), { replace: true })
        },
        [!currentPersona, changeCurrentPersona, navigate],
    )

    return (
        <>
            <Box className={classes.header}>
                <Typography variant="h1" className={classes.title}>
                    <Trans>Recover your data</Trans>
                </Typography>
                <Button
                    variant="text"
                    className={classes.setup}
                    onClick={() => {
                        navigate(DashboardRoutes.SignUpPersona)
                    }}>
                    <Trans>Sign Up</Trans>
                </Button>
            </Box>

            <Typography className={classes.second} mt={2}>
                <Trans>Please select the appropriate method to restore your personal data.</Trans>
            </Typography>
            <RecoveryProvider>
                <div className={classes.tabContainer}>
                    <TabContext value={currentTab}>
                        <div className={classes.tabList}>
                            <MaskTabList variant="base" onChange={onChange} aria-label="Recovery Methods">
                                <Tab
                                    className={classes.tab}
                                    label={<Trans>Recovery Phrase</Trans>}
                                    value={tabs.mnemonic}
                                />
                                <Tab
                                    className={classes.tab}
                                    label={<Trans>Private Key</Trans>}
                                    value={tabs.privateKey}
                                />
                                <Tab className={classes.tab} label={<Trans>Local Backup</Trans>} value={tabs.local} />
                                <Tab className={classes.tab} label={<Trans>Cloud Backup</Trans>} value={tabs.cloud} />
                            </MaskTabList>
                        </div>
                        <div className={classes.panelContainer}>
                            <TabPanel value={tabs.mnemonic} classes={tabPanelClasses}>
                                <RestoreFromMnemonic
                                    handleRestoreFromMnemonic={handleRestoreFromMnemonic}
                                    error={error}
                                    setError={setError}
                                />
                            </TabPanel>
                            <TabPanel value={tabs.privateKey} classes={tabPanelClasses}>
                                <RestoreFromPrivateKey handleRestoreFromPrivateKey={handleRestoreFromPrivateKey} />
                            </TabPanel>
                            <TabPanel value={tabs.local} classes={tabPanelClasses}>
                                <RestorePersonaFromLocal onRestore={onRestore} />
                            </TabPanel>
                            <TabPanel value={tabs.cloud} classes={tabPanelClasses}>
                                <RestoreFromCloud />
                            </TabPanel>
                        </div>
                    </TabContext>
                </div>
                <SetupFrameController>
                    <Outlet />
                </SetupFrameController>
            </RecoveryProvider>
        </>
    )
})
function Outlet() {
    const { classes } = useStyles()
    return <div className={classes.buttonGroup}>{use(RecoveryContext).SubmitOutlet}</div>
}
