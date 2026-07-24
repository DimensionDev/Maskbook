import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { DashboardRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import type { PortalContainerProps } from '../../../../components/OutletPortal.js'

const useStyles = makeStyles()((theme) => ({
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
        color: theme.vars.palette.maskColor.main,
    },
    toggleButton: {
        cursor: 'pointer',
        boxSizing: 'border-box',
        borderRadius: 18,
        height: 34,
        gap: theme.spacing(1),
        border: `1px solid ${theme.vars.palette.maskColor.line}`,
        display: 'inline-flex',
        padding: theme.spacing(1, 1.5),
        backgroundColor: theme.vars.palette.maskColor.input,
    },
}))

export const Component = memo(function CloudBackup() {
    const outletContext = useOutletContext<PortalContainerProps>()
    const { classes } = useStyles()

    const navigate = useNavigate()

    return (
        <Box className={classes.container}>
            <Box className={classes.providers}>
                <button
                    type="button"
                    className={classes.toggleButton}
                    onClick={() => navigate(DashboardRoutes.RecoveryCloudGoogleDrive, { replace: true })}>
                    <Icons.GoogleDrive size={18} />
                    <Typography className={classes.providerName}>
                        <Trans>Google Drive</Trans>
                    </Typography>
                </button>
            </Box>
            <Outlet context={outletContext} />
        </Box>
    )
})
