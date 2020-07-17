import React, { useState, useEffect } from 'react'
import {
    makeStyles,
    Theme,
    createStyles,
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Select,
    MenuItem,
    FormControl,
    IconButton,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ShadowRootDialog from '../../../utils/jss/ShadowRootDialog'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { EthereumTokenType } from '../../Wallet/database/types'
import type { ERC20TokenDetails } from '../../../extension/background-script/PluginService'
import { useVideoDevices } from '../../../utils/hooks/useVideoDevices'
import { PortalShadowRoot } from '../../../utils/jss/ShadowRootPortal'
import { usePermission } from 'react-use'
import { QRCodeVideoScanner } from '../../../extension/options-page/DashboardComponents/QRCodeVideoScanner'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            [`@media (min-width: ${theme.breakpoints.width('md')}px)`]: {
                width: 340,
                margin: '0 auto',
            },
        },
        content: {
            wordBreak: 'break-all',
        },
        formControl: {
            minWidth: 200,
            maxWidth: '100%',
        },
    }),
)

interface TransferDialogProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    title?: string
    message?: string
    open: boolean
    onClose(): void
}

//#region transfer success dialog
export interface TransferSuccessDialogProps extends TransferDialogProps {
    recipient?: string
    recipientAddress: string
    amount: number
    token: ERC20TokenDetails | null
    tokenType: EthereumTokenType
}

export function TransferSuccessDialog(props: TransferSuccessDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { recipient, recipientAddress, amount, token, tokenType, title, open, onClose } = props
    return (
        <ShadowRootDialog
            classes={{
                container: classes.container,
            }}
            open={open}
            fullScreen={false}
            onClose={onClose}>
            <DialogTitle>{title ?? 'Transferred Successfully'}</DialogTitle>
            <DialogContent>
                <DialogContentText className={classes.content}>{`You have transferred to "${
                    recipient ?? recipientAddress
                }" ${tokenType === EthereumTokenType.ETH ? 'ETH' : token?.symbol} ${amount}.`}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </ShadowRootDialog>
    )
}
//#endregion

//#region transfer fail dialog
export interface TransferFailDialogProps extends TransferDialogProps {}

export function TransferFailDialog(props: TransferFailDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { title, message, open, onClose } = props
    return (
        <ShadowRootDialog
            classes={{
                container: classes.container,
            }}
            open={open}
            fullScreen={false}
            onClose={onClose}>
            <DialogTitle>{title ?? 'Transferred Failed'}</DialogTitle>
            <DialogContent>
                <DialogContentText className={classes.content}>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </ShadowRootDialog>
    )
}
//#endregion

//#region qr code scanner dialog
const useQRCodeVideoScannerDialogStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            padding: 0,
        },
        closeButton: {
            margin: 'auto',
            width: 28 * 1.2,
            height: 28 * 1.2,
            left: 0,
            right: 0,
            bottom: 28,
            position: 'absolute',
        },
        closeIcon: {
            color: theme.palette.common.white,
            width: 28,
            height: 28,
        },
    }),
)
export interface QRCodeVideoScannerDialogProps extends TransferDialogProps {
    deviceId?: string
    onScan?: (val: string) => void
    onError?: () => void
}

export function QRCodeVideoScannerDialog(props: QRCodeVideoScannerDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const dialogClasses = useQRCodeVideoScannerDialogStyles()
    const { deviceId, open, onClose, onScan, onError } = props
    return (
        <ShadowRootDialog
            classes={{
                container: classes.container,
            }}
            open={open}
            fullScreen={false}
            onClose={onClose}>
            <DialogContent className={dialogClasses.content}>
                {open ? (
                    <QRCodeVideoScanner
                        scanning={open}
                        onScan={async (data: string) => {
                            onClose()
                            onScan?.(data)
                        }}
                        deviceId={deviceId}
                        onError={onError}
                        onQuit={onClose}
                        VideoProps={{
                            style: {
                                width: '100%',
                                display: 'block',
                            },
                        }}
                    />
                ) : null}
            </DialogContent>
            <IconButton className={dialogClasses.closeButton} onClick={onClose} size="small">
                <CloseIcon className={dialogClasses.closeIcon} />
            </IconButton>
        </ShadowRootDialog>
    )
}
//#ednregion

//#region select camera dialog
const USER_MEDIA_CONSTRAINTS: MediaStreamConstraints = {
    video: true,
    audio: false,
}

export interface SelectCameraDialogProps extends TransferDialogProps {
    onConfirm: (deviceId: string) => void
    onScan?: (content: string) => void
    onError?: () => void
}

export function SelectCameraDialog(props: SelectCameraDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { open, onConfirm, onClose, onScan, onError } = props

    const permissionState = usePermission({ name: 'camera' })
    const devices = useVideoDevices()
    const filteredDevices = devices.filter((d) => !!d.deviceId)
    const [selectedDeviceId, setSelectedDeviceId] = useState('')

    console.log(`DEBUG: select camera dialog`)
    console.log(permissionState)
    console.log(devices)

    // set default device id
    useEffect(() => {
        if (permissionState !== 'granted') return
        if (!selectedDeviceId && filteredDevices[0]?.deviceId) setSelectedDeviceId(filteredDevices[0]?.deviceId)
    }, [permissionState, filteredDevices, selectedDeviceId])
    return (
        <ShadowRootDialog
            classes={{
                container: classes.container,
            }}
            open={open}
            fullScreen={false}
            onClose={onClose}>
            <DialogTitle>Select Camera</DialogTitle>
            <DialogContent>
                {filteredDevices.length ? (
                    <FormControl className={classes.formControl} variant="filled">
                        <Select
                            value={selectedDeviceId}
                            variant="outlined"
                            MenuProps={{
                                container: PortalShadowRoot,
                            }}>
                            {filteredDevices.map(({ deviceId, label }) => (
                                <MenuItem key={deviceId} value={deviceId}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : null}
                {permissionState === 'denied' ? (
                    <DialogContentText>Cannot get the permission to access the carmera.</DialogContentText>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
                {permissionState === 'granted' ? (
                    <Button
                        onClick={() => {
                            onClose()
                            onConfirm(selectedDeviceId)
                        }}
                        color="primary">
                        Confirm
                    </Button>
                ) : null}
                {permissionState === 'denied' ? (
                    <Button
                        onClick={() =>
                            navigator.mediaDevices.getUserMedia({
                                video: true,
                                audio: false,
                            })
                        }
                        color="primary">
                        Grant Permission
                    </Button>
                ) : null}
            </DialogActions>
        </ShadowRootDialog>
    )
}
//#endregion
