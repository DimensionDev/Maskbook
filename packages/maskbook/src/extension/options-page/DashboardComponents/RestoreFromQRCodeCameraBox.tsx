import { useState, useEffect } from 'react'
import { Box, FormControl, Select, MenuItem, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import CropFreeIcon from '@material-ui/icons/CropFree'
import { useModal } from '../DashboardDialogs/Base'
import { QRCodeVideoScannerDialog } from '../DashboardDialogs/Setup'
import { useStylesExtends } from '@masknet/shared'
import { useVideoDevices } from '../../../utils/hooks/useVideoDevices'
import { nativeAPI } from '../../../utils/native-rpc'
import { NativeQRScanner } from '../../../components/shared/qrcode'

const useStyles = makeStyles()((theme) => ({
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
}))

export interface RestoreFromQRCodeCameraBoxProps extends withClasses<never> {
    onScan?: (content: string) => void
    onError?: () => void
}

export const RestoreFromQRCodeCameraBox =
    nativeAPI?.type === 'iOS'
        ? NativeQRScanner
        : (props: RestoreFromQRCodeCameraBoxProps) => {
              const { onScan, onError } = props

              const classes = useStylesExtends(useStyles(), props)
              const [qrCodeVideoScannerDialog, , openQRCodeVideoScannerDialog] = useModal(QRCodeVideoScannerDialog)

              const devices = useVideoDevices()
              const filteredDevices = devices.filter((d) => !!d.deviceId)
              const [selectedDeviceId, setSelectedDeviceId] = useState('')

              // set default device id
              useEffect(() => {
                  if (!selectedDeviceId && filteredDevices[0]?.deviceId)
                      setSelectedDeviceId(filteredDevices[0]?.deviceId)
              }, [filteredDevices, selectedDeviceId])

              return (
                  <Box
                      className={classes.root}
                      sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                      }}>
                      <FormControl className={classes.formControl} variant="filled">
                          <Select
                              value={selectedDeviceId}
                              variant="outlined"
                              MenuProps={{
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
