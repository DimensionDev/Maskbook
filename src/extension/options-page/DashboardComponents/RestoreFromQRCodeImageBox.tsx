import React, { useState, useRef, useCallback } from 'react'
import { useDropArea } from 'react-use'
import { makeStyles, createStyles, Box, FormControl, Select, MenuItem, Button } from '@material-ui/core'
import CropFreeIcon from '@material-ui/icons/CropFree'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useModal } from '../Dialogs/Base'
import { QRCodeVideoScannerDialog } from '../Dialogs/Setup'
import { RestoreBox } from './RestoreBox'
import { QRCodeImageScanner } from './QRCodeImageScanner'
import { PortalShadowRoot } from '../../../utils/jss/ShadowRootPortal'
import { useStylesExtends } from '../../../components/custom-ui-helper'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            height: 120,
        },
        file: {
            display: 'none',
        },
        restoreBoxRoot: {
            overflow: 'auto',
            boxSizing: 'border-box',
            border: `solid 1px ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'center',
            height: 120,
            marginBottom: 16,
            borderRadius: 4,
        },

        restoreBoxPlaceholder: {
            marginBottom: 6,
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

export interface RestoreFromQRCodeBoxProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onScan?: (scannedContent: string) => void
    onError?: () => void
}

export function RestoreFromQRCodeBox(props: RestoreFromQRCodeBoxProps) {
    const { onScan, onError } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [qrCodeVideoScannerDialog, , openQRCodeVideoScannerDialog] = useModal(QRCodeVideoScannerDialog)

    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [bound, { over }] = useDropArea({
        onFiles(files) {
            setFile(files[0])
        },
    })

    const scanImage = useCallback(
        (content: string) => {
            onScan?.(content)
            if (!content) onError?.()
        },
        [onScan, onError],
    )
    const scanVideo = useCallback(
        (content: string) => {
            setFile(null)
            scanImage(content)
        },
        [scanImage],
    )

    return (
        <div className={classes.root} {...bound}>
            <input
                className={classes.file}
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                    if (currentTarget.files) {
                        setFile(currentTarget.files.item(0))
                    }
                }}
            />
            <RestoreBox
                classes={{ root: classes.restoreBoxRoot, placeholder: classes.restoreBoxPlaceholder }}
                file={file}
                entered={over}
                enterText={t('restore_database_advance_dragging')}
                leaveText={t('restore_database_advance_dragged')}
                placeholder="restore-image-placeholder"
                data-active={over}
                onClick={() => inputRef.current && inputRef.current.click()}>
                {file ? <QRCodeImageScanner file={file} onScan={scanImage} onError={onError} /> : null}
            </RestoreBox>
            <Box display="flex" justifyContent="space-between">
                <FormControl className={classes.formControl} variant="filled">
                    <Select
                        value={10}
                        variant="outlined"
                        MenuProps={{
                            container: PortalShadowRoot,
                            classes: { paper: classes.menuPaper },
                        }}>
                        <MenuItem value={10}>Default Camera</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    className={classes.button}
                    color="primary"
                    variant="outlined"
                    onClick={() =>
                        openQRCodeVideoScannerDialog({
                            onScan: scanVideo,
                            onError,
                        })
                    }>
                    <CropFreeIcon />
                </Button>
            </Box>
            {qrCodeVideoScannerDialog}
        </div>
    )
}
