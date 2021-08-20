import { memo, useCallback, useState } from 'react'
import { Alert, alertClasses, Collapse, styled, IconButton } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'
import { getMaskColor, MaskColorVar } from '@masknet/theme'
import { InfoIcon } from '@masknet/icons'

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
        backgroundColor: `${MaskColorVar.redMain.alpha(0.15)}`,
    },
    [`&.${alertClasses.standardError} .${alertClasses.icon}`]: {
        color: `${getMaskColor(theme).redMain}`,
    },
    [`&.${alertClasses.standardError} .${alertClasses.action}`]: {
        color: `${getMaskColor(theme).redMain}`,
    },
    [`&.${alertClasses.standardError} .${alertClasses.message}`]: {
        color: `${getMaskColor(theme).redMain}`,
    },
}))

export interface MaskAlertProps {
    description: string
    type?: 'error' | 'info'
}

export const MaskAlert = memo(({ description, type = 'info' }: MaskAlertProps) => {
    const [openAlert, setOpenAlert] = useState(true)

    return (
        <Collapse in={openAlert}>
            <InfoAlert
                icon={<InfoIcon />}
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
