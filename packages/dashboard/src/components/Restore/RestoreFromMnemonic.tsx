import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { some } from 'lodash-es'
import { useCallback, useLayoutEffect } from 'react'
import { useList } from 'react-use'
import { usePersonaRecovery } from '../../contexts/index.js'
import { useDashboardI18N } from '../../locales/index.js'
import { DesktopMnemonicConfirm } from '../Mnemonic/index.js'
import { PrimaryButton } from '../PrimaryButton/index.js'

const useStyles = makeStyles()((theme) => ({
    error: {
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        color: getMaskColor(theme).redMain,
        borderLeft: `2px solid ${getMaskColor(theme).redMain}`,
    },
}))

interface RestoreFromMnemonicProp {
    handleRestoreFromMnemonic?: (values: string[]) => void
    error?: string
    setError?: (error: string) => void
}

export function RestoreFromMnemonic({ handleRestoreFromMnemonic, error, setError }: RestoreFromMnemonicProp) {
    const { classes } = useStyles()
    const t = useDashboardI18N()
    const [values, { updateAt, set: setMnemonic }] = useList(Array.from({ length: 12 }, () => ''))
    const { fillSubmitOutlet } = usePersonaRecovery()
    const handleWordChange = useCallback((word: string, index: number) => {
        updateAt(index, word)
        setError?.('')
    }, [])

    const handleImport = useCallback(async () => handleRestoreFromMnemonic?.(values), [values])

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                size="large"
                color="primary"
                onClick={handleImport}
                disabled={some(values, (value) => !value)}>
                {t.continue()}
            </PrimaryButton>,
        )
    }, [handleImport, values])

    return (
        <Box>
            <DesktopMnemonicConfirm onChange={handleWordChange} puzzleWords={values} setAll={setMnemonic} />
            {error ? (
                <Typography className={classes.error} variant="body2">
                    {error}
                </Typography>
            ) : null}
        </Box>
    )
}
