import Services from '#services'
import { zodResolver } from '@hookform/resolvers/zod'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans, useLingui as useLinguiMacro } from '@lingui/react/macro'
import { delay } from '@masknet/kit'
import { DashboardRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Portal } from '@mui/material'
import { memo, useCallback } from 'react'
import { Controller, useForm, type SubmitHandler, type UseFormSetError } from 'react-hook-form'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { z } from 'zod'
import PasswordField from '../../../components/PasswordField/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SignUpRoutePath } from '../../SignUp/routePath.js'
import type { PortalContainerProps } from '../types.js'

const useStyles = makeStyles()((theme) => ({
    input: {
        backgroundColor: theme.palette.maskColor.input,
        color: theme.palette.maskColor.main,
    },
}))
const schema = z.object({
    privateKey: z.string(),
})
export type FormInputs = z.infer<typeof schema>
export const Component = memo(function RecoveryPrivateKey() {
    const { classes } = useStyles()
    const { portalContainerRef } = useOutletContext<PortalContainerProps>()
    const { t } = useLinguiMacro()
    const { _ } = useLingui()
    const navigate = useNavigate()

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormInputs>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            privateKey: '',
        },
    })

    const handleRestoreFromPrivateKey = useCallback(
        async (data: FormInputs, onError: UseFormSetError<FormInputs>) => {
            try {
                const persona = await Services.Identity.loginExistPersonaByPrivateKey(data.privateKey)
                if (persona) {
                    await Services.Settings.setCurrentPersonaIdentifier(persona)
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
        [_, navigate],
    )

    const onSubmit: SubmitHandler<FormInputs> = useCallback(
        async (data) => {
            await handleRestoreFromPrivateKey(data, setError)
        },
        [navigate, setError, handleRestoreFromPrivateKey],
    )

    return (
        <Box width="100%">
            <Controller
                control={control}
                render={({ field }) => (
                    <PasswordField
                        {...field}
                        autoFocus
                        InputProps={{
                            className: classes.input,
                            disableUnderline: true,
                        }}
                        autoComplete="off"
                        sx={{ width: '100%' }}
                        type="password"
                        helperText={errors.privateKey?.message}
                        error={!!errors.privateKey}
                        placeholder={t`Input your Private Key`}
                    />
                )}
                name="privateKey"
            />
            <Portal container={() => portalContainerRef.current}>
                <PrimaryButton
                    size="large"
                    color="primary"
                    disabled={isSubmitting || !isDirty}
                    onClick={handleSubmit(onSubmit)}>
                    <Trans>Continue</Trans>
                </PrimaryButton>
            </Portal>
        </Box>
    )
})
