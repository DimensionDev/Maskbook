import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { timeout } from '@masknet/kit'
import { LoadingStatus } from '@masknet/shared'
import { DashboardRoutes, type NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { alpha, ActionButton, makeStyles } from '@masknet/theme'
import { useQueryClient } from '@tanstack/react-query'
import { Box, Typography, type BoxProps } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import urlcat from 'urlcat'
import {
    FIREFLY_EMBEDDED_WALLETS_QUERY_KEY,
    useChainContext,
    useFireflyEmbeddedWallets,
} from '@masknet/web3-hooks-base'
import { EVMWeb3, FireflyEmbeddedWalletClient } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => {
    return {
        mask: {
            position: 'absolute',
            inset: 0,
            margin: 'auto',
            background: alpha(theme.vars.palette.maskColor.bottom, 0.8),
            backdropFilter: 'blur(10px)',
            padding: theme.spacing(4),
        },
        addWalletWrapper: {
            display: 'flex',
            width: 368,
            padding: 12,
            alignItems: 'center',
            gap: 8,
            background: theme.vars.palette.maskColor.bottom,
            border: `1px solid ${theme.vars.palette.maskColor.line}`,
            borderRadius: 8,
            cursor: 'pointer',
        },
        subTitle: {
            color: theme.vars.palette.maskColor.main,
            fontSize: 12,
            fontWeight: 700,
        },
        description: {
            color: theme.vars.palette.maskColor.third,
            fontSize: 12,
            fontWeight: 400,
        },
        mnemonicIcon: {
            background: theme.vars.palette.maskColor.success,
        },
        walletIcon: {
            background: theme.vars.palette.maskColor.primary,
        },
        iconWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 30,
            height: 30,
            borderRadius: '100%',
        },
    }
})

interface Props extends BoxProps {
    /** Choose creating or importing wallet */
    onChoose?(route: DashboardRoutes): void
}

async function loginFirefly() {
    try {
        await Services.Helper.loginFireflyViaTwitter()
        return
    } catch {
        // ignore
    }
    const result = await Services.Helper.requestXOAuthToken()
    if (result) {
        await Services.Helper.loginFireflyViaTwitter()
    }
}
export const ImportCreateWallet = memo<Props>(function ImportCreateWallet({ onChoose, ...props }) {
    const { classes, cx, theme } = useStyles()
    const [params] = useSearchParams()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const navigate = useNavigate()
    const [, handleChoose] = useAsyncFn(
        async (route: DashboardRoutes) => {
            const hasPassword = await Services.Wallet.hasPassword()
            const url = urlcat(hasPassword ? route : DashboardRoutes.CreateMaskWalletForm, {
                recover: route === DashboardRoutes.RecoveryMaskWallet && !hasPassword ? true : undefined,
            })
            await browser.tabs.create({
                active: true,
                url: browser.runtime.getURL(`/dashboard.html#${url}`),
            })
            onChoose?.(route)
        },
        [onChoose],
    )

    const queryClient = useQueryClient()
    const timeoutMessage = 'X account authorization timed out'
    const [{ loading: creatingPrivy, error }, createPrivyWallet] = useAsyncFn(async () => {
        await timeout(loginFirefly(), 3 * 60 * 1000, timeoutMessage)
        // Idempotently create the embedded wallet on the Firefly backend, then
        // refresh the shared embedded-wallets query so the discovery hook picks it up.
        await FireflyEmbeddedWalletClient.ensureEmbeddedWallet()
        await queryClient.invalidateQueries({ queryKey: FIREFLY_EMBEDDED_WALLETS_QUERY_KEY })
    }, [queryClient])

    const isCreatingFireflyWallet = !!params.get('creatingFireflyWallet')
    const { wallets } = useFireflyEmbeddedWallets()
    const selectPrivyWallet = useCallback(async () => {
        if (!wallets.length) return
        if (wallets.length > 1) {
            navigate(PopupRoutes.SelectWallet)
            return
        }
        await EVMWeb3.connect({
            account: wallets[0].address,
            chainId,
            providerType: ProviderType.MaskWallet,
        })
        navigate(PopupRoutes.Wallet)
    }, [wallets, chainId])

    useAsync(async () => {
        if (!isCreatingFireflyWallet) return
        await createPrivyWallet()
        await selectPrivyWallet()
    }, [isCreatingFireflyWallet, selectPrivyWallet])

    const oauthTimeout = error?.message === timeoutMessage

    return (
        <Box
            {...props}
            sx={[
                { display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' },
                ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
            ]}>
            <Box
                className={classes.addWalletWrapper}
                onClick={async () => {
                    await browser.tabs.create({
                        active: true,
                        url: browser.runtime.getURL(`/dashboard.html#${DashboardRoutes.CreateFireflyWallet}`),
                    })
                }}>
                <div
                    className={classes.iconWrapper}
                    style={{
                        boxShadow: '0 6px 12px 0 rgba(0, 0, 0, 0.20)',
                        backdropFilter: 'blur(8px)',
                    }}>
                    <Icons.Firefly size={30} />
                </div>
                <div>
                    <Typography className={classes.subTitle}>
                        <Trans>Create a Privy Wallet</Trans>
                    </Typography>
                    <Typography className={classes.description}>
                        <Trans>Create a Privy wallet using an X account</Trans>
                    </Typography>
                </div>
            </Box>
            <Box
                className={classes.addWalletWrapper}
                onClick={() => handleChoose(DashboardRoutes.CreateMaskWalletMnemonic)}>
                <div
                    className={cx(classes.iconWrapper, classes.walletIcon)}
                    style={{
                        boxShadow: '0 6px 12px 0 rgba(28, 104, 243, 0.20)',
                        backdropFilter: 'blur(8px)',
                    }}>
                    <Icons.Wallet size={20} color={theme.vars.palette.maskColor.white} />
                </div>
                <div>
                    <Typography className={classes.subTitle}>
                        <Trans>Create a New Wallet</Trans>
                    </Typography>
                    <Typography className={classes.description}>
                        <Trans>Generate a new wallet address</Trans>
                    </Typography>
                </div>
            </Box>

            <Box className={classes.addWalletWrapper} onClick={() => handleChoose(DashboardRoutes.RecoveryMaskWallet)}>
                <div
                    className={cx(classes.iconWrapper, classes.mnemonicIcon)}
                    style={{
                        boxShadow: '0 6px 12px 0 rgba(61, 194, 51, 0.20)',
                        backdropFilter: 'blur(8px)',
                    }}>
                    <Icons.Mnemonic size={20} color={theme.vars.palette.maskColor.white} />
                </div>
                <div>
                    <Typography className={classes.subTitle}>
                        <Trans>Import Wallets</Trans>
                    </Typography>
                    <Typography className={classes.description}>
                        <Trans>Support mnemonic phrase, private key or keystore file.</Trans>
                    </Typography>
                </div>
            </Box>
            {creatingPrivy || oauthTimeout ?
                <Box className={classes.mask}>
                    {oauthTimeout ?
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Icons.Time size={32} color={theme.vars.palette.maskColor.main} />
                            <Typography sx={{ color: theme.vars.palette.maskColor.second, fontWeight: 400, my: 1.5 }}>
                                <Trans>Your X account authorization has timed out. Please try again.</Trans>
                            </Typography>
                            <ActionButton fullWidth onClick={createPrivyWallet}>
                                <Trans>Try Again</Trans>
                            </ActionButton>
                        </Box>
                    :   <LoadingStatus sx={{ gap: 3 }}>
                            <Trans>
                                Creating or retrieving your wallet with Privy. Please confirm on the X authorization
                                page.
                            </Trans>
                        </LoadingStatus>
                    }
                </Box>
            :   null}
        </Box>
    )
})
