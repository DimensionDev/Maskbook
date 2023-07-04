import { zodResolver } from '@hookform/resolvers/zod'
import { delay } from '@masknet/kit'
import { DashboardRoutes } from '@masknet/shared-base'
import { MaskTextField } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useCallback, useLayoutEffect } from 'react'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Services } from '../../API.js'
import { useDashboardI18N } from '../../locales/index.js'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext.js'
import { SignUpRoutePath } from '../../pages/SignUp/routePath.js'
import { PrimaryButton } from '../PrimaryButton/index.js'
import { usePersonaRecovery } from '../../contexts/index.js'

const schema = z.object({
    privateKey: z.string(),
})
type FormInputs = z.infer<typeof schema>

export const RestoreFromPrivateKey = memo(function RestoreFromPrivateKey() {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const { fillSubmitOutlet } = usePersonaRecovery()

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

    const onSubmit: SubmitHandler<FormInputs> = useCallback(
        async (data) => {
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
                setError('privateKey', { type: 'value', message: t.sign_in_account_private_key_error() })
            }
        },
        [navigate, setError],
    )

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                size="large"
                color="primary"
                disabled={isSubmitting || !isDirty}
                onClick={handleSubmit(onSubmit)}>
                {t.continue()}
            </PrimaryButton>,
        )
    }, [isSubmitting, isDirty, handleSubmit, onSubmit])

    return (
        <Box width="100%">
            <Controller
                control={control}
                render={({ field }) => (
                    <MaskTextField
                        {...field}
                        sx={{ width: '100%' }}
                        type="password"
                        helperText={errors.privateKey?.message}
                        error={!!errors.privateKey}
                        placeholder={t.sign_in_account_private_key_placeholder()}
                    />
                )}
                name="privateKey"
            />
        </Box>
    )
})
