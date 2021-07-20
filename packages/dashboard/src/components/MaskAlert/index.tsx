import { memo, useCallback, useState } from 'react'
import { Alert, Collapse, IconButton, experimentalStyled as styled, Typography } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'

const InfoAlert = styled(Alert)`
    background-color: ${MaskColorVar.infoBackground};
`

const AlertTypography = styled(Typography)(
    ({ theme }) => `
    color: ${MaskColorVar.secondaryInfoText};
    font-size: ${theme.typography.caption.fontSize};
    line-height: 16px;
`,
)

export const MaskAlert = memo(() => {
    const [openAlert, setOpenAlert] = useState(true)

    const t = useDashboardI18N()

    return (
        <Collapse in={openAlert}>
            <InfoAlert
                severity="info"
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={useCallback(() => setOpenAlert(false), [])}>
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }>
                <AlertTypography>{t.wallets_create_wallet_alert()}</AlertTypography>
            </InfoAlert>
        </Collapse>
    )
})
