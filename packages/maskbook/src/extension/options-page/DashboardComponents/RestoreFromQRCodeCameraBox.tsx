import React, { useState, useEffect } from 'react'
import { makeStyles, createStyles, Box, FormControl, Select, MenuItem, Button } from '@material-ui/core'
import CropFreeIcon from '@material-ui/icons/CropFree'
import { useModal } from '../DashboardDialogs/Base'
import { QRCodeVideoScannerDialog } from '../DashboardDialogs/Setup'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useVideoDevices } from '../../../utils/hooks/useVideoDevices'
import { hasWKWebkitRPCHandlers, iOSHost } from '../../../utils/iOS-RPC'
import { useAsync } from 'react-use'

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

export const RestoreFromQRCodeCameraBox = hasWKWebkitRPCHandlers
    ? (props: RestoreFromQRCodeCameraBoxProps) => {
          useAsync(async () => {
              props.onScan?.(await iOSHost.scanQRCode())
          })
          return null
      }
    : (props: RestoreFromQRCodeCameraBoxProps) => {
          const { onScan, onError } = props

          const classes = useStylesExtends(useStyles(), props)
          const [qrCodeVideoScannerDialog, , openQRCodeVideoScannerDialog] = useModal(QRCodeVideoScannerDialog)

          const devices = useVideoDevices()
          const filteredDevices = devices.filter((d) => !!d.deviceId)
          const [selectedDeviceId, setSelectedDeviceId] = useState('')

          // set default device id
          useEffect(() => {
              if (!selectedDeviceId && filteredDevices[0]?.deviceId) setSelectedDeviceId(filteredDevices[0]?.deviceId)
          }, [filteredDevices, selectedDeviceId])

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
                          {filteredDevices.map(({ deviceId, label }) => (
                              <MenuItem key={deviceId} value={deviceId}>
                                  {label}
                              </MenuItem>
                          ))}
                      </Select>
                  </FormControl>
                  <Button
                      className={classes.button}
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
