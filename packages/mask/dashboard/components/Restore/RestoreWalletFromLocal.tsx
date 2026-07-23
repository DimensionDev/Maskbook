import { Trans, useLingui } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { FileFrame, UploadDropArea } from '@masknet/shared'
import { makeStyles, useSnackbar } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo, useCallback, useLayoutEffect, useState, type ReactNode } from 'react'
import { usePersonaRecovery } from '../../contexts/RecoveryContext.js'
import PasswordField from '../PasswordField/index.js'
import { PrimaryButton } from '../PrimaryButton/index.js'

const useStyles = makeStyles()((theme) => ({
    uploadedFile: {
        marginTop: theme.spacing(1.5),
    },
    desc: {
        color: theme.vars.palette.maskColor.second,
        fontWeight: 700,
        fontSize: 12,
        marginTop: 7,
    },
}))
interface RestoreFromLocalProps {
    onRestore: (keyStoreContent: string, keyStorePassword: string) => Promise<void>
    setError: (error: ReactNode) => void
    error: ReactNode
}

export const RestoreWalletFromLocal = memo(function RestoreWalletFromLocal({
    onRestore,
    setError,
    error,
}: RestoreFromLocalProps) {
    const { t } = useLingui()
    const { classes, theme } = useStyles()
    const { fillSubmitOutlet } = usePersonaRecovery()

    const [keyStoreContent, setKeyStoreContent] = useState('')
    const [keyStorePassword, setKeyStorePassword] = useState('')

    const [file, setFile] = useState<File | null>(null)

    const { enqueueSnackbar } = useSnackbar()
    const [readingFile, setReadingFile] = useState(false)

    const handleSetFile = useCallback(async (file: File) => {
        setFile(file)
        if (file.type === 'application/json') {
            setReadingFile(true)
            const [value] = await Promise.all([file.text(), delay(1000)])
            setKeyStoreContent(value)
            setReadingFile(false)
        } else {
            enqueueSnackbar(<Trans>Unsupported key store data</Trans>, { variant: 'error' })
        }
    }, [])
    const reset = useCallback(() => {
        setFile(null)
    }, [])

    const disabled = readingFile || !file

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                size="large"
                color="primary"
                onClick={() => onRestore(keyStoreContent, keyStorePassword)}
                disabled={disabled}>
                <Trans>Continue</Trans>
            </PrimaryButton>,
        )
    }, [disabled, keyStoreContent, keyStorePassword])

    return (
        <Box sx={{ width: '100%' }}>
            <UploadDropArea onSelectFile={handleSetFile} omitSizeLimit />
            {file ?
                <>
                    <FileFrame
                        className={classes.uploadedFile}
                        fileName={file.name}
                        operations={
                            <Button variant="text" disableRipple sx={{ p: 1, minWidth: 'auto' }} onClick={reset}>
                                <Icons.Clear size={24} color={theme.vars.palette.maskColor.main} />
                            </Button>
                        }>
                        <Typography className={classes.desc}>
                            {readingFile ?
                                <Trans>Unpacking</Trans>
                            :   <Trans>Completed</Trans>}
                        </Typography>
                    </FileFrame>
                    {readingFile ? null : (
                        <Box sx={{ mt: 4 }}>
                            <PasswordField
                                fullWidth
                                placeholder={t`Keystore password`}
                                type="password"
                                onChange={(e) => {
                                    setKeyStorePassword(e.target.value)
                                    setError('')
                                }}
                                error={!!error}
                                helperText={error}
                                autoFocus
                            />
                        </Box>
                    )}
                </>
            :   null}
        </Box>
    )
})
