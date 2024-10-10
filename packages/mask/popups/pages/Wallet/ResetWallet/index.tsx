import Services from '#services'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MaskSharedTrans } from '../../../../shared-ui/index.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { DashboardRoutes } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.maskColor.secondaryBottom,
    },
    content: {
        flexGrow: 1,
        padding: '0px 16px',
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    titleWrapper: {
        paddingTop: 8,
        height: 100,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontStyle: 'normal',
        fontWeight: 700,
        marginBottom: 12,
    },
    description: {
        marginTop: 8,
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    strong: {
        color: theme.palette.maskColor.danger,
        fontWeight: 700,
    },
    bottomAction: {
        display: 'flex',
        justifyContent: 'center',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        backdropFilter: 'blur(8px)',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        padding: '16px',
        alignItems: 'center',
        alignSelf: 'stretch',
        gap: 6,
    },
    button: {
        flex: '1 0 0',
        '&:disabled': {
            color: theme.palette.maskColor.white,
        },
    },
}))

export const Component = memo(function ResetWallet() {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const [answer, setAnswer] = useState('')
    const disabled = answer !== 'RESET'

    const onBack = useCallback(() => navigate(-1), [])

    const onConfirm = useCallback(async () => {
        // We don't reset existed wallets until recovery
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#/${DashboardRoutes.CreateMaskWalletForm}?reset=true`),
        })

        await Services.Helper.removePopupWindow()
    }, [])

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <Box className={classes.titleWrapper}>
                    <Typography className={classes.title}>
                        <Trans>Reset Wallet</Trans>
                    </Typography>
                </Box>
                <Typography className={classes.description}>
                    <Trans>
                        Payment password stored locally and you could try as many as you want to unlock your wallet.
                    </Trans>
                </Typography>
                <Typography className={classes.description}>
                    {/* eslint-disable-next-line react/naming-convention/component-name */}
                    <MaskSharedTrans.popups_wallet_reset_wallet_description_2
                        components={{ strong: <strong className={classes.strong} /> }}
                    />
                </Typography>
                <Typography className={classes.description}>
                    <Trans>
                        Note: If you using the mnemonic phrase from your last import, you can recover the wallet derived
                        from that mnemonic phrase.
                    </Trans>
                </Typography>
                <StyledInput
                    type="text"
                    autoFocus
                    placeholder="RESET"
                    value={answer}
                    onChange={(ev) => {
                        setAnswer(ev.currentTarget.value)
                    }}
                />
            </Box>
            <Box className={classes.bottomAction}>
                <Button onClick={onBack} variant="outlined" className={classes.button}>
                    <Trans>Cancel</Trans>
                </Button>
                <ActionButton
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    className={classes.button}
                    disabled={disabled}>
                    <Trans>Confirm</Trans>
                </ActionButton>
            </Box>
        </Box>
    )
})
