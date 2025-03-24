import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Alert } from '@masknet/shared'
import { BackupAccountType, DashboardRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Portal, Radio, RadioGroup, Typography, type BoxProps } from '@mui/material'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import urlcat from 'urlcat'
import { UserContext } from '../../../../../shared-ui/index.js'
import { PrimaryButton } from '../../../../components/PrimaryButton/index.js'
import { fetchDownloadLink } from '../../../../utils/api.js'
import type { PortalContainerProps } from '../types.js'
import { EmailForm } from './EmailForm.js'
import { PhoneForm } from './PhoneForm.js'
import { useCloudBackupForm, type CloudBackupFormInputs } from './useCloudBackupForm.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    tabContainer: {
        overflow: 'hidden',
    },
    radios: {
        flexDirection: 'row',
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-evenly',
    },
    radioContainer: {
        flexGrow: 1,
        '& label': {
            cursor: 'pointer',
        },
    },
}))

interface Props extends PortalContainerProps, BoxProps {}

export const MaskNetworkBackup = memo<Props>(function MaskNetworkBackup({ portalContainerRef, ...rest }) {
    const { classes } = useStyles()
    const { user, updateUser } = UserContext.useContainer()
    const navigate = useNavigate()
    const [showAlert, setShowAlert] = useState(true)
    const [backupType, setBackupType] = useState<BackupAccountType>(BackupAccountType.Email)

    const { formState } = useCloudBackupForm(backupType)

    const isEmail = backupType === BackupAccountType.Email
    const incorrectCodeMsg = t`The code is incorrect.`
    const [{ loading }, handleSubmit] = useAsyncFn(
        async (data: CloudBackupFormInputs) => {
            const response = await fetchDownloadLink({
                account: isEmail ? data.email : `+${data.countryCode} ${data.phone}`,
                type: isEmail ? BackupAccountType.Email : BackupAccountType.Phone,
                code: data.code,
            }).catch((error) => {
                if (error.status === 400) {
                    formState.setError('code', {
                        type: 'custom',
                        message: incorrectCodeMsg,
                    })
                } else if (error.status === 404) {
                    // No cloud backup file
                    navigate(
                        urlcat(DashboardRoutes.CloudBackupPreview, {
                            type: isEmail ? BackupAccountType.Email : BackupAccountType.Phone,
                            account: isEmail ? data.email : `+${data.countryCode} ${data.phone}`,
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
                    type: isEmail ? BackupAccountType.Email : BackupAccountType.Phone,
                    account: isEmail ? data.email : `+${data.countryCode} ${data.phone}`,
                    code: data.code,
                }),
            )
        },
        [isEmail, formState, navigate, updateUser, user],
    )

    return (
        <Box {...rest} className={classes.container}>
            <RadioGroup
                className={classes.radios}
                value={backupType}
                onChange={() => {
                    setBackupType(isEmail ? BackupAccountType.Phone : BackupAccountType.Email)
                }}>
                <div className={classes.radioContainer}>
                    <label>
                        <Radio value={BackupAccountType.Email} />
                        <Typography component="span">{t`Email`}</Typography>
                    </label>
                </div>
                <div className={classes.radioContainer}>
                    <label>
                        <Radio value={BackupAccountType.Phone} />
                        <Typography component="span">{t`Mobile`}</Typography>
                    </label>
                </div>
            </RadioGroup>
            {isEmail ?
                <EmailForm />
            :   <PhoneForm />}
            <Alert severity="warning" open={showAlert} onClose={() => setShowAlert(false)}>
                <Trans>
                    The Mask Network Cloud Backup feature will be deactivated on April 30, 2025. Please use alternative
                    cloud backup services or local backup solutions.
                </Trans>
            </Alert>
            <Portal container={() => portalContainerRef.current}>
                <PrimaryButton
                    size="large"
                    color="primary"
                    loading={loading}
                    disabled={!formState.formState.isDirty || !formState.formState.isValid}
                    onClick={formState.handleSubmit(handleSubmit)}>
                    <Trans>Continue</Trans>
                </PrimaryButton>
            </Portal>
        </Box>
    )
})
