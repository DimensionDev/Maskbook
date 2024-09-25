import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { FileFrame, UploadDropArea } from '@masknet/shared'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo, useCallback, useLayoutEffect, useState, type ReactNode } from 'react'
import { usePersonaRecovery } from '../../contexts/RecoveryContext.js'
import { useDashboardTrans } from '../../locales/index.js'
import PasswordField from '../PasswordField/index.js'
import { PrimaryButton } from '../PrimaryButton/index.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    uploadedFile: {
        marginTop: theme.spacing(1.5),
    },
    desc: {
        color: theme.palette.maskColor.second,
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

export const RestoreWalletFromLocal = memo(function RestorePersonaFromLocal({
    onRestore,
    setError,
    error,
}: RestoreFromLocalProps) {
    const { _ } = useLingui()
    const { classes, theme } = useStyles()
    const t = useDashboardTrans()
    const { fillSubmitOutlet } = usePersonaRecovery()

    const [keyStoreContent, setKeyStoreContent] = useState('')
    const [keyStorePassword, setKeyStorePassword] = useState('')

    const [file, setFile] = useState<File | null>(null)

    const { showSnackbar } = useCustomSnackbar()
    const [readingFile, setReadingFile] = useState(false)

    const handleSetFile = useCallback(
        async (file: File) => {
            setFile(file)
            if (file.type === 'application/json') {
                setReadingFile(true)
                const [value] = await Promise.all([file.text(), delay(1000)])
                setKeyStoreContent(value)
                setReadingFile(false)
            } else {
                showSnackbar(<Trans>Unsupported key store data</Trans>, { variant: 'error' })
            }
        },
        [t],
    )
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
    }, [t, disabled, keyStoreContent, keyStorePassword])

    return (
        <Box width="100%">
            <UploadDropArea onSelectFile={handleSetFile} omitSizeLimit />
            {file ?
                <>
                    <FileFrame
                        className={classes.uploadedFile}
                        fileName={file.name}
                        operations={
                            <Button variant="text" disableRipple sx={{ p: 1, minWidth: 'auto' }} onClick={reset}>
                                <Icons.Clear size={24} color={theme.palette.maskColor.main} />
                            </Button>
                        }>
                        <Typography className={classes.desc}>
                            {readingFile ?
                                <Trans>Unpacking</Trans>
                            :   <Trans>Completed</Trans>}
                        </Typography>
                    </FileFrame>
                    {!readingFile ?
                        <Box mt={4}>
                            <PasswordField
                                fullWidth
                                placeholder={_(msg`Keystore password`)}
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
                    :   null}
                </>
            :   null}
        </Box>
    )
})
