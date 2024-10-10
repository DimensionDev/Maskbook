import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { some } from 'lodash-es'
import { useCallback, useLayoutEffect, type ReactNode } from 'react'
import { useList } from 'react-use'
import { usePersonaRecovery } from '../../contexts/index.js'
import { DesktopMnemonicConfirm } from '../Mnemonic/index.js'
import { PrimaryButton } from '../PrimaryButton/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    error: {
        marginTop: theme.spacing(2),
        color: theme.palette.maskColor.danger,
    },
}))

interface RestoreFromMnemonicProp {
    handleRestoreFromMnemonic?: (values: string[]) => Promise<void>
    error?: ReactNode
    setError?: (error: ReactNode) => void
}

export function RestoreFromMnemonic({ handleRestoreFromMnemonic, error, setError }: RestoreFromMnemonicProp) {
    const { classes } = useStyles()
    const [values, { updateAt, set: setMnemonic }] = useList(Array.from({ length: 12 }, () => ''))
    const { fillSubmitOutlet } = usePersonaRecovery()
    const handleWordChange = useCallback((word: string, index: number) => {
        updateAt(index, word)
        setError?.(undefined)
    }, [])

    const handleImport = useCallback(async () => handleRestoreFromMnemonic?.(values), [values])

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                size="large"
                color="primary"
                onClick={handleImport}
                disabled={some(values, (value) => !value)}>
                <Trans>Continue</Trans>
            </PrimaryButton>,
        )
    }, [handleImport, values])

    return (
        <Box>
            <DesktopMnemonicConfirm onChange={handleWordChange} puzzleWords={values} setAll={setMnemonic} />
            {error ?
                <Typography className={classes.error} variant="body2">
                    {error}
                </Typography>
            :   null}
        </Box>
    )
}
