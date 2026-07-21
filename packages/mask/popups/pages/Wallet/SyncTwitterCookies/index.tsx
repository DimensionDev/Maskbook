import { Trans, useLingui } from '@lingui/react/macro'
import { CopyButton, FormattedAddress } from '@masknet/shared'
import { PersistentStorages } from '@masknet/shared-base'
import { makeStyles, useSnackbar } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { QRCode } from 'react-qrcode-logo'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSubscription } from 'use-subscription'
import urlcat from 'urlcat'
import { useAsyncFn, useInterval } from 'react-use'
import { WalletAvatar } from '../../../components/WalletAvatar/index.js'
import { useTitle, useTokenParams } from '../../../hooks/index.js'
import Services from '#services'

// Generate a 6-digit crypto key for encryption
function generateCryptoKey(): string {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    const number = array[0] % 1_000_000
    return number.toString().padStart(6, '0')
}

async function getTwitterCookiesString(): Promise<string> {
    // cSpell:disable
    const keys = [
        'guest_id_marketing',
        'guest_id_ads',
        'personalization_id',
        'guest_id',
        '__cf_bm',
        'gt',
        '__cuid',
        '_twitter_sess',
        'kdt',
        'twid',
        'ct0',
        'auth_token',
        'g_state',
        'lang',
        'connect',
        'cf_clearance',
    ]
    // cSpell:enable
    const results = await Promise.allSettled(
        keys.map((key) =>
            browser.cookies.get({ name: key, url: 'https://x.com/' }).then((x) => ({ key, value: x?.value })),
        ),
    )
    const cookies = results
        .filter((x) => x.status === 'fulfilled')
        .map((x) => (x as PromiseFulfilledResult<{ key: string; value?: string }>).value)
        .filter((x) => x.value !== undefined)
        .map((x) => `${x.key}=${x.value}`)
        .join('; ')
    return cookies
}

enum DesktopSyncChannelStatus {
    Pending = 'pending',
    Scanned = 'scanned',
    Confirmed = 'confirmed',
    DataReady = 'dataReady',
    Cancel = 'cancel',
    Expired = 'expired',
}

const POLLING_INTERVAL = 2000 // 2 seconds

const useStyles = makeStyles()((theme) => {
    return {
        header: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            gap: '10px',
            padding: theme.spacing(2),
            marginTop: '14px',
        },
        name: {
            color: theme.vars.palette.maskColor.main,
            fontSize: 18,
            fontWeight: 700,
            lineHeight: '22px',
        },
        address: {
            color: theme.vars.palette.maskColor.second,
            marginTop: theme.spacing(1),
            fontSize: 16,
            height: 30,
            display: 'flex',
            alignItems: 'center',
        },
        qrcode: {
            width: 220,
            height: 220,
            boxShadow: theme.vars.palette.maskColor.bottomBg,
            borderRadius: theme.spacing(2),
            overflow: 'hidden',
        },
        halo: {
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden',
            '&:before': {
                position: 'absolute',
                left: '-10%',
                top: 10,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage:
                    'radial-gradient(50% 50.00% at 50% 50.00%, #FFE9E9 0%, rgba(255, 233, 233, 0.00) 100%)',
                ...theme.applyStyles('dark', {
                    backgroundImage:
                        'radial-gradient(50% 50.00% at 50% 50.00%, #443434 0%, rgba(68, 52, 52, 0.00) 100%)',
                }),
            },
            '&:after': {
                position: 'absolute',
                left: '70%',
                top: 20,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage:
                    'radial-gradient(50% 50.00% at 50% 50.00%, #F0E9FF 0%, rgba(240, 233, 255, 0.00) 100%)',
                ...theme.applyStyles('dark', {
                    backgroundImage:
                        'radial-gradient(50% 50.00% at 50% 50.00%, #605675 0%, rgba(56, 51, 67, 0.00) 100%)',
                }),
            },
        },
        qrcodeContainer: {
            width: 252,
            margin: theme.spacing(1, 'auto', 0),
            padding: theme.spacing(2),
            backgroundColor: theme.vars.palette.maskColor.bottom,
            position: 'relative',
            zIndex: 10,
            borderRadius: '32px',
        },
        tip: {
            fontSize: 16,
            marginTop: 8,
            textAlign: 'center',
            color: theme.vars.palette.maskColor.second,
        },
        copyButton: {
            marginLeft: 8,
            color: theme.vars.palette.maskColor.main,
        },
        statusMessage: {
            fontSize: 13,
            marginTop: 8,
            fontWeight: 400,
            color: theme.vars.palette.maskColor.main,
            padding: '6px',
            border: `1px solid ${theme.vars.palette.maskColor.line}`,
            backgroundColor: theme.vars.palette.maskColor.bottom,
            margin: '8px 10px 10px',
            '&:empty': {
                display: 'none',
            },
        },
        page: {
            position: 'relative',
            height: '100%',
            overflow: 'auto',
            // space for action group.
            paddingBottom: 72,
            zIndex: 3,
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        bottomAction: {
            position: 'fixed',
            display: 'flex',
            justifyContent: 'center',
            background: theme.vars.palette.maskColor.secondaryBottom,
            boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(8px)',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
        },
        button: {
            color: theme.vars.palette.maskColor.second,
            flexGrow: 1,
            minWidth: 0,
            height: theme.spacing(5),
            boxSizing: 'border-box',
            backgroundColor: theme.vars.palette.maskColor.thirdMain,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            border: 'none',
            backdropFilter: 'blur(5px)',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
            fontWeight: 700,
            fontSize: 14,
            '&:hover': {
                transform: 'scale(1.03)',
            },
            '&:active': {
                transform: 'scale(0.97)',
            },
        },
        confirmButton: {
            backgroundColor: theme.vars.palette.maskColor.main,
            color: theme.vars.palette.maskColor.bottom,
            '&:disabled': {
                opacity: 0.5,
            },
        },
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing(2),
            padding: theme.spacing(2),
            width: '100%',
        },
    }
})

export const Component = memo(function SyncTwitterCookies() {
    const { t } = useLingui()
    const { classes, cx } = useStyles()
    const { address } = useTokenParams()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const fireflyAccount = useSubscription(PersistentStorages.Settings.storage.firefly_account.subscription)
    const { enqueueSnackbar } = useSnackbar()

    useTitle(t`Connect your Firefly App`)

    const walletName = params.get('name') || fireflyAccount.displayName
    const accessToken = fireflyAccount.accessToken

    // State for sync flow
    const [cryptoKey, setCryptoKey] = useState(generateCryptoKey)
    const [channelStatus, setChannelStatus] = useState<DesktopSyncChannelStatus | null>(null)
    const [invalidMap, setInvalidMap] = useState<{ [property: string]: boolean }>({})
    const [statusStackMap, setStatusStackMap] = useState<{ [property: string]: DesktopSyncChannelStatus[] }>({})

    // Reset all states when regenerating QR code
    const resetStates = useCallback(() => {
        setCryptoKey(generateCryptoKey())
        setChannelStatus(null)
        setInvalidMap({})
        setStatusStackMap({})
    }, [])

    const {
        isLoading,
        isRefetching,
        data: linkInfo,
        refetch: refetchDesktopLinkInfo,
    } = useQuery({
        queryKey: ['desktop-sync-link-info-session', cryptoKey],
        queryFn: () => Services.Helper.getDesktopSyncLinkInfo(accessToken),
        enabled: !!accessToken,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    })

    const session = linkInfo?.session
    const isInvalid = session ? invalidMap[session] : false

    const errorMessage = useMemo(() => {
        if (channelStatus === DesktopSyncChannelStatus.Expired && session) {
            const statusStack = statusStackMap[session] || []
            if (statusStack.includes(DesktopSyncChannelStatus.Scanned)) {
                return t`Login request expired due to no confirmation. Please try again.`
            }
        }
        if (isInvalid && session) {
            return t`QR code expired. Please try again.`
        }
        return null
    }, [channelStatus, session, statusStackMap, isInvalid, t])

    useEffect(() => {
        if (isInvalid && session) {
            // Auto-regenerate after showing the message
            const timer = setTimeout(async () => {
                resetStates()
                await refetchDesktopLinkInfo()
            }, 2000)
            return () => clearTimeout(timer)
        }
        return
    }, [isInvalid, session, resetStates, refetchDesktopLinkInfo])

    const [{ loading: isUploading }, uploadCookies] = useAsyncFn(async () => {
        if (!session || !cryptoKey || !accessToken) return

        try {
            // Get Twitter OAuth data from storage
            const oauthData = await Services.Helper.getTwitterOAuthData()
            if (!oauthData) {
                throw new Error(t`Twitter OAuth data not found. Please login via Twitter OAuth first.`)
            }

            // Request cookie permission
            const hasPermission = await browser.permissions.contains({ permissions: ['cookies'] })
            if (!hasPermission) {
                const granted = await browser.permissions.request({ permissions: ['cookies'] })
                if (!granted) {
                    throw new Error(t`Cookie permission denied`)
                }
            }

            const cookiesString = await getTwitterCookiesString()

            // Build SocialAccountTwitter array
            const twitterAccounts: Array<{
                type: 'x'
                user_id: string
                handle: string
                consumerKey: string
                consumerKeySecret: string
                accessToken: string
                accessTokenSecret: string
                cookie: string
            }> = [
                {
                    type: 'x',
                    user_id: oauthData.user_id,
                    handle: oauthData.screen_name,
                    consumerKey: process.env.FIREFLY_X_CLIENT_ID || '',
                    consumerKeySecret: process.env.FIREFLY_X_CLIENT_SECRET || '',
                    accessToken: oauthData.oauth_token,
                    accessTokenSecret: oauthData.oauth_token_secret,
                    cookie: cookiesString,
                },
            ]

            const payload = JSON.stringify({
                twitterAccounts,
                fireflyAccountData: {
                    firefly_account_token: accessToken,
                    account_id: fireflyAccount.accountId,
                    account_uid: fireflyAccount.uid,
                    display_name: fireflyAccount.displayName,
                    avatar: fireflyAccount.avatar,
                },
            })

            const encryptedPayload = await Services.Helper.encrypt(payload, cryptoKey)

            await Services.Helper.syncTwitterCookies(session, cryptoKey, encryptedPayload, accessToken)

            setChannelStatus(DesktopSyncChannelStatus.DataReady)
            enqueueSnackbar(t`Twitter cookies synced successfully`, { variant: 'success' })
            navigate(-1)
        } catch (err) {
            enqueueSnackbar((err as Error).message || t`Login failed. Please try again`, { variant: 'error' })
        }
    }, [session, cryptoKey, accessToken, fireflyAccount])

    const [{ loading: isCanceling }, handleCancel] = useAsyncFn(async () => {
        if (!session || !accessToken) return

        await Services.Helper.confirmSyncChannel(session, 'cancel', accessToken)
        resetStates()
        await refetchDesktopLinkInfo()
    }, [session, accessToken, resetStates, refetchDesktopLinkInfo])

    const pollStatus = useCallback(async () => {
        if (!session || !accessToken) return

        try {
            const status = await Services.Helper.getSyncChannelStatus(session, accessToken)
            const newStatus = status.status as DesktopSyncChannelStatus
            setChannelStatus(newStatus)

            // Record status transition for this session
            setStatusStackMap((prev) => {
                const stack = prev[session] || []
                if (stack.at(-1) !== newStatus) {
                    return { ...prev, [session]: [...stack, newStatus] }
                }
                return prev
            })

            // Handle expired/cancelled states
            if (
                (newStatus === DesktopSyncChannelStatus.Expired || newStatus === DesktopSyncChannelStatus.Cancel) &&
                session
            )
                setInvalidMap((x) => ({ ...x, [session]: true }))
        } catch (error_) {
            enqueueSnackbar((error_ as Error).message || t`Network error. Please try again later.`, {
                variant: 'error',
            })
        }
    }, [session, accessToken])

    useInterval(pollStatus, POLLING_INTERVAL)

    const schemaUrl = session && cryptoKey ? urlcat('firefly://account/scan/desktop-sync', { session, cryptoKey }) : ''

    return (
        <>
            <div className={classes.halo}>
                <Box className={classes.page}>
                    <Box className={classes.header}>
                        <WalletAvatar address={address} size={48} badgeSize={16} />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography className={classes.name}>{walletName}</Typography>
                            <Typography className={classes.address}>
                                <FormattedAddress address={address} formatter={formatEthereumAddress} size={4} />
                                <CopyButton text={address} size={18} className={classes.copyButton} />
                            </Typography>
                        </Box>
                    </Box>
                    <div className={classes.halo}>
                        <div
                            className={classes.qrcodeContainer}
                            onClick={async () => {
                                resetStates()
                                await refetchDesktopLinkInfo()
                            }}
                            style={{ cursor: 'pointer' }}>
                            <Box className={classes.qrcode}>
                                {!isLoading && !isRefetching && schemaUrl ?
                                    <QRCode
                                        value={schemaUrl}
                                        ecLevel="L"
                                        size={188}
                                        quietZone={16}
                                        eyeRadius={100}
                                        qrStyle="dots"
                                    />
                                :   null}
                            </Box>
                        </div>
                    </div>
                    <Typography className={classes.tip}>
                        <Trans>Use the Firefly app to scan the QR code</Trans>
                    </Typography>
                    <Typography className={classes.statusMessage}>
                        {errorMessage ||
                            (channelStatus === DesktopSyncChannelStatus.Scanned ?
                                <Trans>
                                    You've received a login request from the Firefly app. If you want to sign in, please
                                    confirm.
                                </Trans>
                            :   null)}
                    </Typography>
                </Box>
            </div>
            <div className={classes.bottomAction}>
                <div className={classes.container}>
                    <button type="button" className={classes.button} disabled={isCanceling} onClick={handleCancel}>
                        <Trans>Cancel</Trans>
                    </button>
                    <button
                        type="button"
                        className={cx(classes.button, classes.confirmButton)}
                        disabled={
                            !session ||
                            isLoading ||
                            isRefetching ||
                            isInvalid ||
                            isUploading ||
                            channelStatus !== DesktopSyncChannelStatus.Scanned ||
                            !!errorMessage
                        }
                        onClick={uploadCookies}>
                        <Trans>Confirm</Trans>
                    </button>
                </div>
            </div>
        </>
    )
})
