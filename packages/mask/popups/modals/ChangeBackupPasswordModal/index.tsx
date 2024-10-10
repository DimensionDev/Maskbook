import { memo, useCallback } from 'react'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { UserContext } from '../../../shared-ui/index.js'
import { Box, Typography, useTheme } from '@mui/material'
import { PasswordField } from '../../components/PasswordField/index.js'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MATCH_PASSWORD_RE } from '../../constants.js'
import { ActionButton, usePopupCustomSnackbar } from '@masknet/theme'
import { useNavigate } from 'react-router-dom'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
type FormInputs = {
    oldPassword: string
    newPassword: string
    repeatPassword: string
}
export const ChangeBackupPasswordModal = memo<ActionModalBaseProps>(function ChangeBackupPasswordModal(props) {
    const { _ } = useLingui()
    const theme = useTheme()

    const navigate = useNavigate()

    const { user, updateUser } = UserContext.useContainer()

    const { showSnackbar } = usePopupCustomSnackbar()

    const {
        control,
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
                        .string()
                        .min(8)
                        .max(20)
                        .refine(
                            (oldPassword) => oldPassword === user.backupPassword,
                            _(msg`Incorrect backup password.`),
                        )
                        .refine(
                            (oldPassword) => MATCH_PASSWORD_RE.test(oldPassword),
                            _(msg`Lack of number, letter or special character.`),
                        ),
                    newPassword: z
                        .string()
                        .min(8)
                        .max(20)
                        .refine(
                            (newPassword) => MATCH_PASSWORD_RE.test(newPassword),
                            _(msg`Lack of number, letter or special character.`),
                        ),
                    repeatPassword: z
                        .string()
                        .min(8)
                        .max(20)
                        .refine(
                            (repeatPassword) => MATCH_PASSWORD_RE.test(repeatPassword),
                            _(msg`Lack of number, letter or special character.`),
                        ),
                })
                .refine((data) => data.newPassword !== data.oldPassword, {
                    message: _(msg`New password cannot be the same as your current password.`),
                    path: ['newPassword'],
                })
                .refine((data) => data.newPassword === data.repeatPassword, {
                    message: _(msg`Two entered passwords are different.`),
                    path: ['repeatPassword'],
                }),
        ),
    })

    const handleFormSubmit = useCallback(
        (data: FormInputs) => {
            updateUser({
                backupPassword: data.newPassword,
            })

            showSnackbar(<Trans>Backup password set successfully</Trans>)

            navigate(-1)
        },
        [handleSubmit, updateUser, showSnackbar],
    )

    return (
        <ActionModal
            header={_(msg`Change Backup Password`)}
            action={
                <ActionButton
                    onClick={handleSubmit(handleFormSubmit)}
                    loading={isSubmitting}
                    disabled={!isDirty || !isValid}>
                    <Trans>Confirm</Trans>
                </ActionButton>
            }
            {...props}>
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
                                placeholder={_(msg`Password`)}
                                autoFocus
                                error={
                                    errors.oldPassword?.type !== 'too_small' && errors.oldPassword?.type !== 'too_big' ?
                                        !!errors.oldPassword?.message
                                    :   false
                                }
                                helperText={
                                    errors.oldPassword?.type !== 'too_small' && errors.oldPassword?.type !== 'too_big' ?
                                        errors.oldPassword?.message
                                    :   ''
                                }
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
                            placeholder={_(msg`New password`)}
                            error={
                                errors.newPassword?.type !== 'too_small' && errors.newPassword?.type !== 'too_big' ?
                                    !!errors.newPassword?.message
                                :   false
                            }
                            helperText={
                                errors.newPassword?.type !== 'too_small' && errors.newPassword?.type !== 'too_big' ?
                                    errors.newPassword?.message
                                :   ''
                            }
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="repeatPassword"
                    render={({ field }) => (
                        <PasswordField
                            {...field}
                            placeholder={_(msg`Re-enter`)}
                            error={
                                (
                                    errors.repeatPassword?.type !== 'too_small' &&
                                    errors.repeatPassword?.type !== 'too_big'
                                ) ?
                                    !!errors.repeatPassword?.message
                                :   false
                            }
                            helperText={
                                (
                                    errors.repeatPassword?.type !== 'too_small' &&
                                    errors.repeatPassword?.type !== 'too_big'
                                ) ?
                                    errors.repeatPassword?.message
                                :   ''
                            }
                        />
                    )}
                />
                <Typography fontSize={12} color={theme.palette.maskColor.second}>
                    <Trans>
                        Backup password must be 8-20 characters, including uppercase, lowercase, special characters and
                        numbers.
                    </Trans>
                </Typography>
            </Box>
        </ActionModal>
    )
})
