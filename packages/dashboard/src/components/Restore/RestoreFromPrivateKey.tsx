import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import type { UseFormSetError, SubmitHandler } from 'react-hook-form'
import { MaskTextField } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useCallback, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useDashboardI18N } from '../../locales/index.js'
import { PrimaryButton } from '../PrimaryButton/index.js'
import { usePersonaRecovery } from '../../contexts/index.js'

export type FormInputs = {
    privateKey: string
}

interface RestoreFromPrivateKeyProps {
    handleRestoreFromPrivateKey?: (data: FormInputs, onError: UseFormSetError<FormInputs>) => Promise<void>
}

export const RestoreFromPrivateKey = memo(function RestoreFromPrivateKey({
    handleRestoreFromPrivateKey,
}: RestoreFromPrivateKeyProps) {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { fillSubmitOutlet } = usePersonaRecovery()

    const schema = z.object({
        privateKey: z.string(),
    })
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
            handleRestoreFromPrivateKey?.(data, setError)
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
