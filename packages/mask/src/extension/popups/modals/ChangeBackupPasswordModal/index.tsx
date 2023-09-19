import { memo, useCallback } from 'react'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, Typography, useTheme } from '@mui/material'
import { PasswordField } from '../../components/PasswordField/index.js'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MATCH_PASSWORD_RE } from '../../constants.js'
import { ActionButton, usePopupCustomSnackbar } from '@masknet/theme'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../../../shared-ui/index.js'
type FormInputs = {
    oldPassword: string
    newPassword: string
    repeatPassword: string
}
export const ChangeBackupPasswordModal = memo<ActionModalBaseProps>(function ChangeBackupPasswordModal({ ...rest }) {
    const { t } = useI18N()
    const theme = useTheme()

    const navigate = useNavigate()

    const { user, updateUser } = UserContext.useContainer()

    const { showSnackbar } = usePopupCustomSnackbar()

    const {
        control,
        resetField,
        handleSubmit,
        formState: { errors, isValid, isSubmitting, isDirty },
    } = useForm<FormInputs>({
        mode: 'onBlur',
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            repeatPassword: '',
        },
        context: {
            user,
        },
        resolver: zodResolver(
            z
                .object({
                    oldPassword: z
                        .string(t('popups_settings_backup_password_invalid'))
                        .min(8, t('popups_settings_backup_password_invalid'))
                        .max(20, t('popups_settings_backup_password_invalid'))
                        .refine(
                            (oldPassword) => oldPassword === user.backupPassword,
                            t('popups_backup_password_incorrect'),
                        )
                        .refine(
                            (oldPassword) => MATCH_PASSWORD_RE.test(oldPassword),
                            t('popups_settings_backup_password_invalid'),
                        ),
                    newPassword: z
                        .string(t('popups_settings_backup_password_invalid'))
                        .min(8, t('popups_settings_backup_password_invalid'))
                        .max(20, t('popups_settings_backup_password_invalid'))
                        .refine(
                            (newPassword) => MATCH_PASSWORD_RE.test(newPassword),
                            t('popups_settings_backup_password_invalid'),
                        ),
                    repeatPassword: z
                        .string(t('popups_settings_backup_password_invalid'))
                        .min(8, t('popups_settings_backup_password_invalid'))
                        .max(20, t('popups_settings_backup_password_invalid'))
                        .refine(
                            (repeatPassword) => MATCH_PASSWORD_RE.test(repeatPassword),
                            t('popups_settings_backup_password_invalid'),
                        ),
                })
                .refine((data) => data.oldPassword === user.backupPassword, {
                    message: t('popups_backup_password_incorrect'),
                    path: ['oldPassword'],
                })
                .refine((data) => data.newPassword !== data.oldPassword, {
                    message: t('popups_settings_new_backup_password_error_tips'),
                    path: ['newPassword'],
                })
                .refine((data) => data.newPassword === data.repeatPassword, {
                    message: t('popups_backup_password_inconsistency'),
                    path: ['repeatPassword'],
                }),
        ),
    })

    const handleFormSubmit = useCallback(
        (data: FormInputs) => {
            updateUser({
                backupPassword: data.newPassword,
            })

            showSnackbar(t('popups_backup_password_set_successfully'))

            navigate(-1)
        },
        [handleSubmit, updateUser, showSnackbar],
    )

    return (
        <ActionModal
            header={t('popups_settings_change_backup_password')}
            action={
                <ActionButton
                    onClick={handleSubmit(handleFormSubmit)}
                    loading={isSubmitting}
                    disabled={!isDirty || !isValid}>
                    {t('confirm')}
                </ActionButton>
            }
            {...rest}>
            <Box
                component="form"
                display="flex"
                justifyContent="center"
                flexDirection="column"
                alignItems="center"
                rowGap={2}
                py={1}
                px={0.25}>
                <Controller
                    control={control}
                    render={({ field }) => {
                        return (
                            <PasswordField
                                {...field}
                                placeholder={t('password')}
                                autoFocus
                                onClear={() => resetField('oldPassword', { defaultValue: '' })}
                                error={!!errors.oldPassword?.message}
                                helperText={errors.oldPassword?.message}
                            />
                        )
                    }}
                    name="oldPassword"
                />
                <Controller
                    control={control}
                    name="newPassword"
                    render={({ field }) => (
                        <PasswordField
                            {...field}
                            placeholder={t('popups_settings_new_backup_password')}
                            onClear={() => resetField('newPassword', { defaultValue: '' })}
                            error={!!errors.newPassword?.message}
                            helperText={errors.newPassword?.message}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="repeatPassword"
                    render={({ field }) => (
                        <PasswordField
                            {...field}
                            placeholder={t('reenter')}
                            onClear={() => resetField('repeatPassword', { defaultValue: '' })}
                            error={!!errors.repeatPassword?.message}
                            helperText={errors.repeatPassword?.message}
                        />
                    )}
                />
                <Typography fontSize={12} color={theme.palette.maskColor.second}>
                    {t('popups_backup_password_rules_tips')}
                </Typography>
            </Box>
        </ActionModal>
    )
})
