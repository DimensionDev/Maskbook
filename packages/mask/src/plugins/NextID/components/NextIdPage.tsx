import { useI18N } from '../locales'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { BindDialog } from './BindDialog'
import { useAsync, useAsyncRetry, useCounter } from 'react-use'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import Services from '../../../extension/service'
import { BindingItem } from './BindingItem'
import type { Platform } from '../types'
import { UnBindDialog } from './UnBindDialog'

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
    const [openBindDialog, toggleBindDialog] = useState(false)
    const [openUnBindDialog, toggleUnBindDialog] = useState(false)
    const [count, { inc }] = useCounter(0)
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
    }, [currentIdentifier, count])

    if (loading || loadingIdentifier) return <Box>Loading</Box>

    if (bindings?.proofs.length) {
        return (
            <>
                <Box>
                    <Box>
                        {bindings.proofs.map((x) => (
                            <BindingItem
                                key={x.identity}
                                platform={x.platform as Platform}
                                identity={x.identity}
                                onUnBind={() => toggleUnBindDialog(true)}
                            />
                        ))}
                    </Box>
                    <Stack justifyContent="center" direction="row">
                        <Button variant="contained" onClick={() => toggleBindDialog(true)}>
                            {t.add_wallet_button()}
                        </Button>
                    </Stack>
                </Box>
                {openBindDialog && currentPersona && (
                    <BindDialog
                        open={openBindDialog}
                        onClose={() => toggleBindDialog(false)}
                        persona={currentPersona}
                        bounds={bindings?.proofs ?? []}
                        onBind={() => inc(1)}
                    />
                )}
                {openUnBindDialog && currentPersona && (
                    <UnBindDialog
                        open={openUnBindDialog}
                        onClose={() => toggleUnBindDialog(false)}
                        persona={currentPersona}
                        onUnBind={() => inc(1)}
                        bounds={bindings?.proofs ?? []}
                    />
                )}
            </>
        )
    }

    return (
        <>
            <Box>
                <Typography className={classes.tip}>{t.connect_wallet_tip()}</Typography>
                <Stack justifyContent="center" direction="row">
                    <Button variant="contained" onClick={() => toggleBindDialog(true)}>
                        {t.verify_wallet_button()}
                    </Button>
                </Stack>
            </Box>
            {openBindDialog && currentPersona && (
                <BindDialog
                    open={openBindDialog}
                    onClose={() => toggleBindDialog(false)}
                    persona={currentPersona}
                    bounds={bindings?.proofs ?? []}
                    onBind={() => inc(1)}
                />
            )}
        </>
    )
}
