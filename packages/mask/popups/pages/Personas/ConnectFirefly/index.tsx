import { useLingui } from '@lingui/react/macro'
import { PopupHomeTabType } from '@masknet/shared'
import { QRCode } from 'react-qrcode-logo'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { useTitle } from '../../../hooks/index.js'

const useStyles = makeStyles()({
    container: {},
})

export const Component = memo(function ConnectFireflyPage() {
    const { t } = useLingui()
    const { classes } = useStyles()

    const navigate = useNavigate()

    const handleBack = useCallback(() => {
        navigate(urlcat(PopupRoutes.Personas, { tab: PopupHomeTabType.ConnectedWallets }), {
            replace: true,
        })
    }, [])

    useTitle(t`Connect Firefly`, handleBack)

    return (
        <Box className={classes.container}>
            <QRCode value="hello" ecLevel="L" size={220} quietZone={16} eyeRadius={100} qrStyle="dots" />
        </Box>
    )
})
