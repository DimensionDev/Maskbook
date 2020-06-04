import React, { useState, useEffect } from 'react'
import { makeStyles, createStyles, Box, FormControl, Select, MenuItem, Button } from '@material-ui/core'
import CropFreeIcon from '@material-ui/icons/CropFree'
import { useModal } from '../Dialogs/Base'
import { QRCodeVideoScannerDialog } from '../Dialogs/Setup'
import { PortalShadowRoot } from '../../../utils/jss/ShadowRootPortal'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useVideoDevices } from '../../../utils/hooks/useVideoDevices'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            marginTop: theme.spacing(2),
        },
        formControl: {
            flex: 1,
        },
        menuPaper: {
            backgroundColor: theme.palette.background.paper,
        },
        button: {
            width: 64,
            minWidth: 'unset',
            padding: 0,
            marginLeft: 16,
        },
    }),
)

export interface RestoreFromQRCodeCameraBoxProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onScan?: (content: string) => void
    onError?: () => void
}

export function RestoreFromQRCodeCameraBox(props: RestoreFromQRCodeCameraBoxProps) {
    const { onScan, onError } = props

    const classes = useStylesExtends(useStyles(), props)
    const [qrCodeVideoScannerDialog, , openQRCodeVideoScannerDialog] = useModal(QRCodeVideoScannerDialog)

    const devices = useVideoDevices()
    const [selectedDeviceId, setSelectedDeviceId] = useState('')

    // set default device id
    useEffect(() => {
        if (!selectedDeviceId && devices[0]?.deviceId) setSelectedDeviceId(devices[0]?.deviceId)
    }, [devices, selectedDeviceId])

    return (
        <Box className={classes.root} display="flex" justifyContent="space-between">
            <FormControl className={classes.formControl} variant="filled">
                <Select
                    value={selectedDeviceId}
                    variant="outlined"
                    MenuProps={{
                        container: PortalShadowRoot,
                        classes: { paper: classes.menuPaper },
                    }}
                    onChange={(e) => setSelectedDeviceId(e.target.value as string)}>
                    {devices.map(({ deviceId, label }) => (
                        <MenuItem key={deviceId} value={deviceId}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button
                className={classes.button}
                color="primary"
                variant="outlined"
                disabled={!selectedDeviceId}
                onClick={() =>
                    openQRCodeVideoScannerDialog({
                        deviceId: selectedDeviceId,
                        onScan,
                        onError,
                    })
                }>
                <CropFreeIcon />
            </Button>
            {qrCodeVideoScannerDialog}
        </Box>
    )
}
