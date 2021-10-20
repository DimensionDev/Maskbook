import { memo, useCallback, useState } from 'react'
import { Alert, alertClasses, Collapse, styled, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { getMaskColor, MaskColorVar } from '@masknet/theme'
import { InfoIcon, RiskIcon, SuccessIcon } from '@masknet/icons'

const InfoAlert = styled(Alert)(({ theme }) => ({
    [`&  > .${alertClasses.message}`]: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '16px',
        color: `${MaskColorVar.secondaryInfoText}`,
        fontSize: `${theme.typography.caption.fontSize}`,
    },
    [`&  > .${alertClasses.icon}`]: {
        alignItems: 'center',
    },
    [`&  > .${alertClasses.action}`]: {
        alignItems: 'center',
    },
    // standard
    [`&.${alertClasses.standardInfo}`]: {
        backgroundColor: `${getMaskColor(theme).infoBackground}`,
    },
    [`&.${alertClasses.standardInfo} .${alertClasses.icon}`]: {
        color: `${getMaskColor(theme).secondaryInfoText}`,
    },
    [`&.${alertClasses.standardInfo} .${alertClasses.action}`]: {
        color: `${getMaskColor(theme).secondaryInfoText}`,
    },
    // error
    [`&.${alertClasses.standardError}`]: {
        backgroundColor: `${MaskColorVar.redMain.alpha(0.1)}`,
    },
    [`&.${alertClasses.standardError} .${alertClasses.icon}`]: {
        color: `${getMaskColor(theme).redMain}`,
        'path:first-child': {
            fill: `${MaskColorVar.redMain.alpha(0.5)}`,
        },
        path: {
            fill: `${getMaskColor(theme).redMain}`,
        },
    },
    [`&.${alertClasses.standardError} .${alertClasses.action}`]: {
        color: `${getMaskColor(theme).redMain}`,
    },
    [`&.${alertClasses.standardError} .${alertClasses.message}`]: {
        color: `${getMaskColor(theme).redMain}`,
    },
    // success
    [`&.${alertClasses.standardSuccess}`]: {
        backgroundColor: `${MaskColorVar.greenMain.alpha(0.1)}`,
    },
    [`&.${alertClasses.standardSuccess} .${alertClasses.icon}`]: {
        color: `${getMaskColor(theme).greenMain}`,
    },
    [`&.${alertClasses.standardSuccess} .${alertClasses.action}`]: {
        color: `${getMaskColor(theme).greenMain}`,
    },
    [`&.${alertClasses.standardSuccess} .${alertClasses.message}`]: {
        color: `${getMaskColor(theme).greenMain}`,
    },
}))

export interface MaskAlertProps {
    description: string
    type?: 'error' | 'info' | 'success' | 'warning'
}

const AlertIconMapping = {
    error: <RiskIcon />,
    info: <InfoIcon />,
    success: <SuccessIcon />,
    warning: <InfoIcon />,
}

export const MaskAlert = memo(({ description, type = 'info' }: MaskAlertProps) => {
    const [openAlert, setOpenAlert] = useState(true)

    return (
        <Collapse in={openAlert}>
            <InfoAlert
                icon={AlertIconMapping[type]}
                severity={type}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={useCallback(() => setOpenAlert(false), [])}>
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }>
                {description}
            </InfoAlert>
        </Collapse>
    )
})
