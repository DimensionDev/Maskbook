import React, { memo, useState } from 'react'
import { Alert, Collapse, IconButton, experimentalStyled as styled, Typography } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

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

    return (
        <Collapse in={openAlert}>
            <InfoAlert
                severity="info"
                action={
                    <IconButton aria-label="close" color="inherit" size="small" onClick={() => setOpenAlert(false)}>
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }>
                <AlertTypography>
                    Mask Network is a free, open-source, client-side interface. Mask Network allows you to interact
                    directly with the blockchain, while you remain in full control of your keys and funds.Please think
                    about this carefully. YOU are the one who is in control. Mask Network is not a bank or exchange. We
                    don't hold your keys, your funds, or your information. This means we can't access accounts, recover
                    keys, reset passwords, or reverse transactions.
                </AlertTypography>
            </InfoAlert>
        </Collapse>
    )
})
