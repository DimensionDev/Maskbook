import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { DashboardRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'
import { Outlet, useMatch, useNavigate, useOutletContext } from 'react-router-dom'
import { CloudBackupFormContext } from './CloudBackupFormContext.js'
import type { PortalContainerProps } from '../../../../components/OutletPortal.js'

const useStyles = makeStyles<void, 'activeButton'>()((theme, _, refs) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    providers: {
        display: 'flex',
        gap: theme.spacing(1.5),
    },
    providerName: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        height: 18,
        color: theme.palette.maskColor.main,
    },
    activeButton: {
        backgroundColor: theme.palette.maskColor.input,
    },
    toggleButton: {
        backgroundColor: theme.palette.maskColor.bottom,
        cursor: 'pointer',
        boxSizing: 'border-box',
        borderRadius: 18,
        height: 34,
        gap: theme.spacing(1),
        border: `1px solid ${theme.palette.maskColor.line}`,
        display: 'inline-flex',
        padding: theme.spacing(1, 1.5),
        [`&.${refs.activeButton}`]: {
            backgroundColor: theme.palette.maskColor.input,
        },
    },
}))

export const Component = memo(function CloudBackup() {
    const outletContext = useOutletContext<PortalContainerProps>()
    const { classes, cx } = useStyles()

    const navigate = useNavigate()
    const match = useMatch(DashboardRoutes.BackupCloudGoogleDrive) // MaskBook is index
    const isGoogleDrive = !!match

    return (
        <Box className={classes.container}>
            <Box className={classes.providers}>
                <button
                    type="button"
                    className={cx(classes.toggleButton, isGoogleDrive ? null : classes.activeButton)}
                    onClick={() => navigate(DashboardRoutes.BackupCloudMaskNetwork, { replace: true })}>
                    <Icons.MaskBlue size={18} />
                    <Typography className={classes.providerName}>
                        <Trans>Mask Network</Trans>
                    </Typography>
                </button>
                <button
                    type="button"
                    className={cx(classes.toggleButton, isGoogleDrive ? classes.activeButton : null)}
                    onClick={() => navigate(DashboardRoutes.BackupCloudGoogleDrive, { replace: true })}>
                    <Icons.GoogleDrive size={18} />
                    <Typography className={classes.providerName}>
                        <Trans>Google Drive</Trans>
                    </Typography>
                </button>
            </Box>
            <CloudBackupFormContext.Provider>
                <Outlet context={outletContext} />
            </CloudBackupFormContext.Provider>
        </Box>
    )
})
