import { memo, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { DashboardTrans, useDashboardTrans } from '../../../locales/i18n_generated.js'
import { Typography, Box, Tab } from '@mui/material'
import { MaskTabList, makeStyles } from '@masknet/theme'
import { UserContext } from '../../../../shared-ui/index.js'
import { TabContext, TabPanel } from '@mui/lab'
import { EmailForm } from './EmailForm.js'
import { CloudBackupFormContext, type CloudBackupFormInputs } from '../../../contexts/CloudBackupFormContext.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { fetchDownloadLink } from '../../../utils/api.js'
import { BackupAccountType, DashboardRoutes } from '@masknet/shared-base'
import { PhoneForm } from './PhoneForm.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
}))

const CloudBackupInner = memo(function CloudBackupInner() {
    const { _ } = useLingui()
    const t = useDashboardTrans()
    const { classes } = useStyles()
    const { user, updateUser } = UserContext.useContainer()
    const navigate = useNavigate()
    const tabPanelClasses = useMemo(() => ({ root: classes.panels }), [classes.panels])

    const { currentTab, onChange, tabs, formState } = CloudBackupFormContext.useContainer()

    const [{ loading }, handleSubmit] = useAsyncFn(
        async (data: CloudBackupFormInputs) => {
            const response = await fetchDownloadLink({
                account: currentTab === tabs.email ? data.email : `+${data.countryCode} ${data.phone}`,
                type: currentTab === tabs.email ? BackupAccountType.Email : BackupAccountType.Phone,
                code: data.code,
            }).catch((error) => {
                if (error.status === 400) {
                    formState.setError('code', {
                        type: 'custom',
                        message: _(msg`The code is incorrect.`),
                    })
                } else if (error.status === 404) {
                    // No cloud backup file
                    navigate(
                        urlcat(DashboardRoutes.CloudBackupPreview, {
                            type: currentTab === tabs.email ? BackupAccountType.Email : BackupAccountType.Phone,
                            account: currentTab === tabs.email ? data.email : `+${data.countryCode} ${data.phone}`,
                            code: data.code,
                        }),
                    )
                }
            })

            if (!response) return

            updateUser({
                email: data.email || user.email,
                phone: data.phone ? `${data.countryCode} ${data.phone}` : user.phone,
            })
            navigate(
                urlcat(DashboardRoutes.CloudBackupPreview, {
                    ...response,
                    type: currentTab === tabs.email ? BackupAccountType.Email : BackupAccountType.Phone,
                    account: currentTab === tabs.email ? data.email : `+${data.countryCode} ${data.phone}`,
                    code: data.code,
                }),
            )
        },
        [currentTab, tabs, formState, navigate, updateUser, user],
    )

    const description = useMemo(() => {
        if (user.cloudBackupMethod === BackupAccountType.Email && user.email)
            return (
                // eslint-disable-next-line react/naming-convention/component-name
                <DashboardTrans.cloud_backup_backup_exists
                    components={{ strong: <strong /> }}
                    values={{ account: user.email }}
                />
            )
        if (user.cloudBackupMethod === BackupAccountType.Phone && user.phone)
            return (
                // eslint-disable-next-line react/naming-convention/component-name
                <DashboardTrans.cloud_backup_backup_exists
                    components={{ strong: <strong /> }}
                    values={{ account: user.phone }}
                />
            )

        return <Trans>Please use your frequently used email or phone number for backup.</Trans>
    }, [user, DashboardTrans, t])
    return (
        <>
            <Box>
                <Typography variant="h1" className={classes.title}>
                    <Trans>Login to Mask Cloud</Trans>
                </Typography>
                <Typography className={classes.description}>{description}</Typography>
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
                                <Tab className={classes.tab} label={<Trans>E-mail</Trans>} value={tabs.email} />
                                <Tab className={classes.tab} label={<Trans>Mobile</Trans>} value={tabs.mobile} />
                            </MaskTabList>
                        </div>
                        <div className={classes.panelContainer}>
                            <TabPanel value={tabs.email} classes={tabPanelClasses}>
                                <EmailForm />
                            </TabPanel>
                            <TabPanel value={tabs.mobile} classes={tabPanelClasses}>
                                <PhoneForm />
                            </TabPanel>
                        </div>
                    </TabContext>
                </Box>
            </Box>
            <SetupFrameController>
                <PrimaryButton
                    size="large"
                    color="primary"
                    loading={loading}
                    disabled={!formState.formState.isDirty || !formState.formState.isValid}
                    onClick={formState.handleSubmit(handleSubmit)}>
                    <Trans>Continue</Trans>
                </PrimaryButton>
            </SetupFrameController>
        </>
    )
})

export const Component = memo(function CloudBackup() {
    return (
        <CloudBackupFormContext>
            <CloudBackupInner />
        </CloudBackupFormContext>
    )
})
