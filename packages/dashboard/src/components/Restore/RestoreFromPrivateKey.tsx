import { memo } from 'react'
import { MaskTextField } from '@masknet/theme'
import { Box, Button } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'
import { MaskAlert } from '../MaskAlert'
import { ButtonGroup } from '../RegisterFrame/ButtonGroup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Services } from '../../API'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller } from 'react-hook-form'
import { z } from 'zod'
type FormInputs = {
    privateKey: string
}

export const RestoreFromPrivateKey = memo(() => {
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const t = useDashboardI18N()
    const schema = z.object({
        privateKey: z.string(),
    })

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
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
                changeCurrentPersona(persona.identifier)
            } else {
                setError('privateKey', { type: 'value', message: t.sign_in_account_private_key_persona_not_found() })
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
                    <ButtonGroup>
                        <Button variant="rounded" color="secondary">
                            {t.cancel()}
                        </Button>
                        <Button variant="rounded" color="primary" type="submit">
                            {t.next()}
                        </Button>
                    </ButtonGroup>
                </form>
            </Box>
            <Box sx={{ marginTop: '35px' }}>
                <MaskAlert description={t.sign_in_account_private_key_warning()} />
            </Box>
        </>
    )
})
