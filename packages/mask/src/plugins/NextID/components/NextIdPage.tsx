import { useI18N } from '../locales'
import { makeStyles } from '@masknet/theme'
import { Box, Button } from '@mui/material'
import { getStorage } from '../storage'
import { useState } from 'react'
import { VerifyWalletDialog } from './VerifyWalletDialog'

const useStyles = makeStyles()((theme) => ({
    tip: {
        background: theme.palette.background.default,
    },
}))

interface NextIDPageProps {}

export function NextIdPage({}: NextIDPageProps) {
    const [openDialog, toggleDialog] = useState(false)
    const currentPersona = getStorage().currentPersona.value
    const t = useI18N()
    const { classes } = useStyles()

    return (
        <>
            <Box>
                <Box className={classes.tip}>{t.connect_wallet_tip()}</Box>
                <Box>
                    <Button variant="contained" onClick={() => toggleDialog(true)}>
                        {t.verify_wallet_button()}
                    </Button>
                </Box>
            </Box>
            {openDialog && <VerifyWalletDialog open={openDialog} onClose={() => toggleDialog(false)} />}
        </>
    )
}
