import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { DEFAULT_DURATION, RoutePaths } from '@masknet/plugin-redpacket'
import { FormattedBalance, PluginWalletStatusBar, useCurrentLinkedPersona } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useAccount, useChainContext, useEnvironmentContext, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { Box, Link, Paper, Typography } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PreviewRedPacket } from '../components/PreviewRedPacket.js'
import { useHandleCreateOrSelect } from '../hooks/useHandleCreateOrSelect.js'
import { useSolRedpacket } from '../contexts/SolRedpacketContext.js'
import { SolanaChainResolver, SolanaExplorerResolver } from '@masknet/web3-providers'
import { dividedBy, formatBalance, formatCurrency, ZERO } from '@masknet/web3-shared-base'
import { isNativeTokenAddress } from '@masknet/web3-shared-solana'
import { useEstimateGasWithCreateSolRedpacket } from '../hooks/useEstimateGasWithCreateSolRedpacket.js'
import { BigNumber } from 'bignumber.js'
import { useAsyncFn } from 'react-use'
import { createWithNativeToken } from '../helpers/createWithNativeToken.js'
import { createWithSplToken } from '../helpers/createWithSplToken.js'
import idl from '../idl/rp.json' with { type: 'json' }
import { getTokenProgram } from '../helpers/getTokenAccount.js'

const useStyles = makeStyles()((theme) => ({
    message: {
        fontSize: 24,
        fontWeight: 700,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
    },
    link: {
        display: 'inline-flex',
        marginLeft: theme.spacing(0.5),
    },
    settings: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        flexGrow: 1,
    },
    field: {
        display: 'flex',
    },
    fieldName: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    fieldValue: {
        marginLeft: 'auto',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
    },
    value: {
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    envelope: {
        width: 484,
        height: 336,
        borderRadius: theme.spacing(2),
        overflow: 'hidden',
    },
    hit: {
        display: 'flex',
        alignItems: 'center',
        maxWidth: 568,
        fontWeight: 300,
        borderRadius: 8,
        backgroundColor: theme.palette.maskColor.bg,
        color: theme.palette.text.primary,
        padding: 12,
    },
    controller: {
        position: 'sticky',
        bottom: 0,
    },
}))

export function SolanaRedPacketConfirm() {
    const { classes, cx } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_SOLANA>()
    const navigate = useNavigate()
    const { settings, shares, isRandom, token, creator, publicKey, password, message, nativeToken, theme } =
        useSolRedpacket()

    const solanaAccount = useAccount(NetworkPluginID.PLUGIN_SOLANA)

    const { pluginID } = useEnvironmentContext()
    const { data: nativeTokenPrice } = useNativeTokenPrice(pluginID)
    const currentIdentity = useCurrentVisitingIdentity()
    const me = useLastRecognizedIdentity()
    const linkedPersona = useCurrentLinkedPersona()
    const senderName = me?.identifier?.userId ?? currentIdentity?.identifier?.userId ?? linkedPersona?.nickname

    const onClose = useCallback(() => {
        navigate(RoutePaths.Exit)
    }, [])
    const handleCreated = useHandleCreateOrSelect({
        senderName,
        onClose,
    })

    const isNativeToken = isNativeTokenAddress(token?.address)

    const formatTotal = useMemo(
        () => formatBalance(settings.total, settings.token?.decimals, { significant: isNativeToken ? 3 : 0 }),
        [settings, isNativeToken],
    )

    const formatAvg = useMemo(() => {
        return formatBalance(dividedBy(settings.total, settings.shares).toFixed(0, 1), settings.token?.decimals ?? 9, {
            significant: isNativeToken ? 3 : 0,
        })
    }, [settings, isNativeToken])

    const { data: defaultGasFee = ZERO, isLoading: estimateLoading } = useEstimateGasWithCreateSolRedpacket(
        shares,
        new BigNumber(settings.total).toNumber(),
        !!isRandom,
        publicKey,
        message,
        creator,
        token,
    )

    const gasFee = defaultGasFee.multipliedBy(5)
    const gasPriceUSD = gasFee.shiftedBy(-9).multipliedBy(nativeTokenPrice ?? 0)

    const [{ loading: isCreating }, createRedpacket] = useAsyncFn(async () => {
        const sender = new SolanaWeb3.PublicKey(solanaAccount)
        const claimer = new SolanaWeb3.PublicKey(publicKey)
        const total = new BigNumber(settings.total).toNumber()
        const tokenMint = token?.address ? new SolanaWeb3.PublicKey(token?.address) : null
        const tokenProgram = tokenMint ? await getTokenProgram(tokenMint) : undefined

        const result = await (isNativeToken ?
            createWithNativeToken(
                sender,
                settings.shares,
                total,
                DEFAULT_DURATION,
                !!isRandom,
                claimer,
                message,
                creator,
            )
        : tokenMint ?
            createWithSplToken(
                sender,
                tokenMint,
                settings.shares,
                total,
                DEFAULT_DURATION,
                !!isRandom,
                claimer,
                message,
                creator,
            )
        :   null)
        if (!result) return

        const payload = {
            sender: {
                address: solanaAccount,
                name: creator,
                message,
            },
            is_random: !!isRandom,
            shares,
            password,
            rpid: `solana-${crypto.randomUUID()}`,
            total: settings.total,
            duration: DEFAULT_DURATION,
            creation_time: Date.now(),
            token,
            network: SolanaChainResolver.chainName(chainId),
            contract_address: idl.address,
            contract_version: 4,
            txid: result.signature,
            accountId: result.accountId.toBase58(),
            tokenProgram: tokenProgram?.toBase58(),
        }

        handleCreated(payload)
    }, [isNativeToken, settings, isRandom, publicKey, message, creator])

    // const { isLoading: creatingPubkey, data: publicKey } = useQuery({
    //     enabled: !!themeId,
    //     queryKey: ['red-packet', 'create-pubkey', themeId, creator],
    //     queryFn: async () => {
    //         if (!themeId) return null
    //         // TODO: StrategyPayload list
    //         return FireflyRedPacket.createPublicKey(themeId, creator, EMPTY_LIST)
    //     },
    // })

    // const {
    //     isBalanceInsufficient,
    //     formatTotal,
    //     estimateGasFee,
    //     formatAvg,
    //     gas,
    //     isCreating,
    //     isWaitGasBeMinus,
    //     createRedpacket,
    // } = useCreateFTRedpacketCallback(
    //     publicKey ?? '',
    //     // TODO get rid of privateKey since we don't need it anymore
    //     '',
    //     settings,
    //     gasOption,
    //     handleCreated,
    //     onClose,
    // )

    // const nativeTokenDetailed = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId])
    // const wallet = useWallet()
    // const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    return (
        <>
            <div className={classes.settings}>
                <Typography variant="h4" color="textPrimary" align="center" className={classes.message}>
                    {settings.message}
                </Typography>
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Split Mode</Trans>
                    </Typography>
                    <Typography variant="body1" className={cx(classes.fieldValue, classes.value)}>
                        {isRandom ?
                            <Trans>Random</Trans>
                        :   <Trans>Identical</Trans>}
                    </Typography>
                </div>
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Share</Trans>
                    </Typography>
                    <Typography variant="body1" className={cx(classes.fieldValue, classes.value)}>
                        {shares}
                    </Typography>
                </div>
                {isRandom ? null : (
                    <div className={classes.field}>
                        <Typography className={classes.fieldName}>
                            <Trans>Amount per Share</Trans>
                        </Typography>
                        <Typography variant="body1" className={cx(classes.fieldValue, classes.value)}>
                            {formatAvg} {token?.symbol}
                            <Link
                                color="textPrimary"
                                className={classes.link}
                                href={SolanaExplorerResolver.fungibleTokenLink(chainId, token?.address ?? '')}
                                target="_blank"
                                rel="noopener noreferrer">
                                <LaunchIcon fontSize="small" />
                            </Link>
                        </Typography>
                    </div>
                )}
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Total cost</Trans>
                    </Typography>
                    <Typography variant="body1" className={cx(classes.fieldValue, classes.value)}>
                        {formatTotal} {token?.symbol}
                        <Link
                            color="textPrimary"
                            className={classes.link}
                            href={SolanaExplorerResolver.fungibleTokenLink(chainId, token?.address ?? '')}
                            target="_blank"
                            rel="noopener noreferrer">
                            <LaunchIcon fontSize="small" />
                        </Link>
                    </Typography>
                </div>

                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Transaction cost</Trans>
                    </Typography>
                    <Box
                        className={cx(classes.fieldValue, classes.value)}
                        style={{ display: 'flex', gap: 4, fontWeight: 700 }}>
                        <FormattedBalance
                            value={gasFee}
                            decimals={9}
                            significant={4}
                            symbol={nativeToken.symbol}
                            formatter={formatBalance}
                        />
                        <Typography style={{ fontWeight: 700 }}>
                            ≈ {formatCurrency(gasPriceUSD, 'USD', { onlyRemainTwoOrZeroDecimal: true })}
                        </Typography>
                    </Box>
                </div>

                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Cover</Trans>
                    </Typography>
                    <div className={classes.fieldValue}>
                        <PreviewRedPacket className={classes.envelope} />
                    </div>
                </div>
                <Paper className={classes.hit}>
                    <Icons.SettingInfo size={20} />
                    <Typography
                        variant="body1"
                        align="left"
                        marginTop="1px"
                        marginLeft="8.5px"
                        style={{ lineHeight: '18px' }}
                        fontSize="14px">
                        <Trans>You can withdraw the remaining balance 24 hours after sending the lucky drop.</Trans>
                    </Typography>
                </Paper>
            </div>
            <PluginWalletStatusBar className={classes.controller}>
                <ActionButton fullWidth onClick={createRedpacket} loading={isCreating || estimateLoading}>
                    <Trans>Confirm</Trans>
                </ActionButton>
                {/* <ActionButton loading={loading} fullWidth onClick={createRedpacket} disabled={disabled}>
                        {isCreating ?
                            <Trans>Confirming</Trans>
                        :   <Trans>Confirm</Trans>}
                    </ActionButton> */}
            </PluginWalletStatusBar>
        </>
    )
}
