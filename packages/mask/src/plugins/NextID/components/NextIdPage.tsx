import { useI18N } from '../locales'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Stack } from '@mui/material'
import { useState } from 'react'
import { VerifyWalletDialog } from './VerifyWalletDialog'
import { useAsync, useAsyncRetry } from 'react-use'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import Services from '../../../extension/service'
import { BindingItem } from './BindingItem'
import type { Platform } from '../types'

const useStyles = makeStyles()((theme) => ({
    tip: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
        borderRadius: 8,
        alignItems: 'center',
    },
}))

interface NextIDPageProps {}

export function NextIdPage({}: NextIDPageProps) {
    const [openDialog, toggleDialog] = useState(false)
    const t = useI18N()
    const { classes } = useStyles()
    const personas = useMyPersonas()
    const { value: currentIdentifier, loading: loadingIdentifier } = useAsyncRetry(
        () => Services.Settings.getCurrentPersonaIdentifier(),
        [],
    )
    const currentPersona = personas.find((x) => x.identifier.equals(currentIdentifier))

    const { value: bindings, loading } = useAsync(() => {
        if (!currentIdentifier) return Promise.resolve(null)
        return Services.Helper.queryExistedBinding(currentIdentifier)
    }, [currentIdentifier])

    if (loading || loadingIdentifier) return <Box>Loading</Box>

    if (bindings?.proofs.length) {
        return (
            <>
                <Box>
                    <Box>
                        {bindings.proofs.map((x) => (
                            <BindingItem key={x.identity} platform={x.platform as Platform} identity={x.identity} />
                        ))}
                    </Box>
                    <Stack justifyContent="center" direction="row">
                        <Button variant="contained" onClick={() => toggleDialog(true)}>
                            {t.add_wallet_button()}
                        </Button>
                    </Stack>
                </Box>
                {openDialog && currentPersona && (
                    <VerifyWalletDialog
                        open={openDialog}
                        onClose={() => toggleDialog(false)}
                        persona={currentPersona}
                    />
                )}
            </>
        )
    }

    return (
        <>
            <Box>
                <Box className={classes.tip}>{t.connect_wallet_tip()}</Box>
                <Stack justifyContent="center" direction="row">
                    <Button variant="contained" onClick={() => toggleDialog(true)}>
                        {t.verify_wallet_button()}
                    </Button>
                </Stack>
            </Box>
            {openDialog && currentPersona && (
                <VerifyWalletDialog open={openDialog} onClose={() => toggleDialog(false)} persona={currentPersona} />
            )}
        </>
    )
}
