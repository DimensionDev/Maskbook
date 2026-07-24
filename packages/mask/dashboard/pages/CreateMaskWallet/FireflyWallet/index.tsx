import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles, useSnackbar } from '@masknet/theme'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { memo, useState } from 'react'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { XOAuthRequestOrigins } from '../../../../shared/definitions/extension.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 1,
    },
    title: {
        fontSize: 30,
        margin: '12px 0',
        lineHeight: '120%',
        color: theme.vars.palette.maskColor.main,
    },
    tips: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.vars.palette.maskColor.second,
    },
    bold: {
        fontWeight: 700,
    },
    notes: {
        display: 'flex',
        padding: theme.spacing(3, 2),
        alignItems: 'center',
        alignContent: 'stretch',
        borderRadius: 12,
        marginTop: theme.spacing(3),
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.20) 0%, rgba(59, 153, 252, 0.20) 100%)',
        ...theme.applyStyles('dark', {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 100%)',
        }),
    },
    fireflyLogo: {
        width: 120,
        height: 120,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        listStyle: 'none',
        color: theme.vars.palette.maskColor.main,
        fontSize: '13px',
        lineHeight: '18px',
        fontWeight: 400,
        paddingLeft: 16,
        margin: 0,
        '& li': {
            marginBottom: 12,
            listStyle: 'disc',
        },
    },
    dialog: {
        width: 600,
        boxSizing: 'border-box',
        padding: 24,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
    },
    dialogTitle: {
        color: theme.vars.palette.maskColor.main,
        fontSize: 18,
        fontWeight: 700,
        lineHeight: '22px',
        padding: 0,
    },
    dialogContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 0,
    },
    permissions: {
        backgroundColor: theme.vars.palette.maskColor.bg,
        padding: 12,
        borderRadius: 8,
        height: 212,
        boxSizing: 'border-box',
        minHeight: 0,
        flexGrow: 1,
        overflow: 'auto',
    },
    dialogActions: {
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        padding: 0,
    },
    actionButton: {
        minWidth: 110,
        '&&': {
            marginLeft: 0,
        },
    },
}))

export const Component = memo(function CreateWalletForm() {
    const { classes, cx } = useStyles()
    const [open, setOpen] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    const {
        retry,
        loading: loadingPermissions,
        value: hasPermission,
    } = useAsyncRetry(async () => {
        const hasPermission = await browser.permissions.contains({
            origins: XOAuthRequestOrigins,
        })
        setOpen(!hasPermission)
        return hasPermission
    }, [])

    const [{ loading: requesting }, request] = useAsyncFn(async () => {
        if (!hasPermission) {
            setOpen(true)
            return
        }
        try {
            await Services.Helper.loginFireflyViaTwitter()
        } catch (err) {
            if ((err as Error).message === 'X OAuth token not found') {
                const result = await Services.Helper.requestXOAuthToken()
                if (result) await Services.Helper.loginFireflyViaTwitter()
            } else {
                enqueueSnackbar(<Trans>Failed to login firefly</Trans>, {
                    variant: 'error',
                    content: (err as Error).message,
                })
                console.error('Failed to login firefly', err)
            }
        }
        await Services.Helper.openPopupWindow(PopupRoutes.CreateWallet, {
            creatingFireflyWallet: true,
        })
        window.close()
    }, [hasPermission])

    const loading = requesting || loadingPermissions

    return (
        <div className={classes.container}>
            <Typography className={cx(classes.title, classes.bold)}>
                <Trans>Create a Firefly.social wallet</Trans>
            </Typography>
            <Typography className={classes.tips}>
                <Trans>Create a Firefly.social wallet using an X account</Trans>
            </Typography>
            <div className={classes.notes}>
                <div className={classes.fireflyLogo}>
                    <Icons.Firefly size={60} />
                </div>
                <ul className={classes.list}>
                    <li>
                        Firefly.social wallet connects your Web3 identity to the entire Mask Network and firefly.social
                        ecosystem.
                    </li>
                    <li>
                        With a single wallet, you can like, post, collect, and transfer across multiple Web3 social
                        platforms — all in one seamless flow.
                    </li>
                    <li>
                        Log in securely in seconds with your X account and unify your EVM, Solana, and other chain
                        identities effortlessly.
                    </li>
                    <li>
                        Firefly.social wallet isn’t just a wallet — it’s your gateway to social, identity, and ownership
                        in Web3.
                    </li>
                </ul>
            </div>
            <SetupFrameController>
                <PrimaryButton
                    width="125px"
                    size="large"
                    color="primary"
                    className={classes.bold}
                    startIcon={<Icons.TwitterX size={20} />}
                    loading={loading}
                    onClick={request}>
                    <Trans>Continue</Trans>
                </PrimaryButton>
            </SetupFrameController>
            <Dialog
                open={open}
                slotProps={{
                    paper: {
                        elevation: 0,
                        className: classes.dialog,
                    },
                }}>
                <DialogTitle className={classes.dialogTitle}>
                    <Trans>Mask needs the following permissions</Trans>
                </DialogTitle>
                <DialogContent className={classes.dialogContent}>
                    <Typography>
                        <Trans>Sites</Trans>
                    </Typography>
                    <div className={classes.permissions} data-hide-scrollbar>
                        {XOAuthRequestOrigins.map((origin) => (
                            <Typography key={origin} sx={{ lineHeight: '18px' }}>
                                {origin}
                            </Typography>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                    <Button onClick={() => setOpen(false)} variant="outlined" className={classes.actionButton}>
                        <Trans>Cancel</Trans>
                    </Button>
                    <Button
                        onClick={() => {
                            browser.permissions.request({ origins: XOAuthRequestOrigins }).finally(retry)
                        }}
                        variant="contained"
                        className={classes.actionButton}>
                        <Trans>Approve</Trans>
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
})
