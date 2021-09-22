import { memo } from 'react'
import { MaskTextField } from '@masknet/theme'
import { Box, Button } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'
import { MaskAlert } from '../MaskAlert'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Services } from '../../API'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'
import { SignUpRoutePath } from '../../pages/SignUp/routePath'
type FormInputs = {
    privateKey: string
}

export const RestoreFromPrivateKey = memo(() => {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { changeCurrentPersona } = PersonaContext.useContainer()

    const schema = z.object({
        privateKey: z.string(),
    })

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormInputs>({
        resolver: zodResolver(schema),
        defaultValues: {
            privateKey: '',
        },
    })

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        try {
            const persona = await Services.Identity.queryPersonaByPrivateKey(data.privateKey)
            if (persona) {
                await changeCurrentPersona(persona.identifier)
                navigate(RoutePaths.Personas)
            } else {
                navigate(`${RoutePaths.SignUp}/${SignUpRoutePath.PersonaCreate}`, {
                    replace: false,
                    state: { privateKey: data.privateKey },
                })
            }
        } catch {
            setError('privateKey', { type: 'value', message: t.sign_in_account_private_key_error() })
        }
    }

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box>
                        <Controller
                            control={control}
                            render={({ field }) => (
                                <MaskTextField
                                    {...field}
                                    sx={{ width: '100%' }}
                                    multiline
                                    rows={8}
                                    helperText={errors.privateKey?.message}
                                    error={!!errors.privateKey}
                                    placeholder={t.sign_in_account_private_key_placeholder()}
                                />
                            )}
                            name="privateKey"
                        />
                    </Box>
                    <ButtonContainer>
                        <Button variant="rounded" color="primary" type="submit" disabled={isSubmitting}>
                            {t.confirm()}
                        </Button>
                    </ButtonContainer>
                </form>
            </Box>
            <Box sx={{ pt: 4, pb: 2, width: '100%' }}>
                <MaskAlert description={t.sign_in_account_private_key_warning()} />
            </Box>
        </>
    )
})
