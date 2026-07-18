import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { RoutePaths } from '@masknet/plugin-redpacket'
import {
    ChainBoundary,
    PluginWalletStatusBar,
    SelectGasSettingsToolbar,
    TokenIcon,
    useCurrentLinkedPersona,
} from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { EVMChainResolver, EVMExplorerResolver, FireflyRedPacket } from '@masknet/web3-providers'
import { isZero } from '@masknet/web3-shared-base'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { Link, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PreviewRedPacket } from '../components/PreviewRedPacket.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { useCreateFTRedpacketCallback } from '../hooks/useCreateFTRedpacketCallback.js'
import { useHandleCreateOrSelect } from '../hooks/useHandleCreateOrSelect.js'

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
    conditions: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
        marginTop: theme.spacing(-1.5),
    },
    conditionGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
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
    assets: {
        display: 'flex',
        gap: theme.spacing(0.5),
        flexFlow: 'row wrap',
    },
    asset: {
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        gap: theme.spacing(1),
    },
    assetName: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: '20px',
        color: theme.palette.maskColor.main,
    },
    tokenIcon: {
        width: 24,
        height: 24,
        marginRight: '0px !important',
    },
}))

export function TokenRedPacketConfirm() {
    const { classes, cx } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const navigate = useNavigate()
    const {
        settings,
        shares,
        isRandom,
        token,
        theme,
        creator,
        gasOption,
        setGasOption,
        tokenQuantity,
        requiredTokens,
        needHoldingTokens,
        claimStrategies,
        message,
        rawAmount,
    } = useRedPacket()

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

    const themeId = theme?.tid
    const { isLoading: creatingPubkey, data: publicKey } = useQuery({
        enabled: !!themeId,
        queryKey: ['red-packet', 'create-pubkey', themeId, creator, claimStrategies],
        queryFn: async () => {
            if (!themeId) return null
            return FireflyRedPacket.createPublicKey(themeId, creator, claimStrategies)
        },
    })

    const {
        isBalanceInsufficient,
        formatTotal,
        estimateGasFee,
        formatAvg,
        gas,
        isCreating,
        isWaitGasBeMinus,
        createRedpacket,
    } = useCreateFTRedpacketCallback(publicKey ?? '', settings, gasOption, handleCreated, onClose)

    const nativeTokenDetailed = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId])
    const nativeTokenPrice = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId }).data || 0

    const loading = creatingPubkey || isCreating || isWaitGasBeMinus
    const disabled = isBalanceInsufficient || loading

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
                        <Typography variant="body1" className={classes.fieldValue}>
                            {isBalanceInsufficient ? '0' : formatAvg} {token?.symbol}
                            <Link
                                color="textPrimary"
                                className={classes.link}
                                href={EVMExplorerResolver.fungibleTokenLink(chainId, token?.address ?? '')}
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
                            href={EVMExplorerResolver.fungibleTokenLink(chainId, token?.address ?? '')}
                            target="_blank"
                            rel="noopener noreferrer">
                            <LaunchIcon fontSize="small" />
                        </Link>
                    </Typography>
                </div>
                {estimateGasFee && !isZero(estimateGasFee) ?
                    <div className={classes.field}>
                        <Typography className={classes.fieldName}>
                            <Trans>Transaction cost</Trans>
                        </Typography>
                        <SelectGasSettingsToolbar
                            className={classes.fieldValue}
                            nativeToken={nativeTokenDetailed}
                            nativeTokenPrice={nativeTokenPrice}
                            gasConfig={gasOption}
                            gasLimit={Number.parseInt(gas ?? '0', 10)}
                            onChange={setGasOption}
                            estimateGasFee={estimateGasFee}
                            editMode
                        />
                    </div>
                :   null}
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Claim Conditions</Trans>
                    </Typography>
                    {needHoldingTokens ? null : (
                        <Typography variant="body1" className={cx(classes.fieldValue, classes.value)}>
                            <Trans>Available to Everyone</Trans>
                        </Typography>
                    )}
                </div>
                <div className={classes.conditions}>
                    {needHoldingTokens ?
                        <div className={classes.conditionGroup}>
                            <div className={classes.field}>
                                <Typography component="span" className={classes.value}>
                                    <Trans>Holding {tokenQuantity ? `${tokenQuantity}+` : 'any'}</Trans>
                                </Typography>
                            </div>
                            <div className={classes.field}>
                                <div className={classes.fieldValue}>
                                    <div className={classes.assets}>
                                        {requiredTokens.map((token, index) => (
                                            <div className={classes.asset} key={token.address}>
                                                {index === 0 ? '' : '/'}
                                                <TokenIcon
                                                    className={classes.tokenIcon}
                                                    address={token.address}
                                                    name={token.name}
                                                    size={24}
                                                    badgeSize={12}
                                                    chainId={token.chainId}
                                                    logoURL={token.logoURL}
                                                />
                                                <Typography className={classes.assetName}>{token.symbol}</Typography>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    :   null}
                </div>
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Cover</Trans>
                    </Typography>
                    <div className={classes.fieldValue}>
                        <PreviewRedPacket
                            className={classes.envelope}
                            theme={theme}
                            message={message}
                            token={token}
                            creator={creator}
                            shares={shares}
                            isRandom={isRandom}
                            rawAmount={rawAmount}
                        />
                    </div>
                </div>
                <Paper className={classes.hit}>
                    <Icons.SettingInfo size={20} />
                    <Typography
                        variant="body1"
                        align="left"
                        style={{ lineHeight: '18px' }}
                        sx={{
                            marginTop: '1px',
                            marginLeft: '8.5px',
                            fontSize: '14px',
                        }}>
                        <Trans>You can withdraw the remaining balance 24 hours after sending the lucky drop.</Trans>
                    </Typography>
                </Paper>
            </div>
            <PluginWalletStatusBar className={classes.controller}>
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                    <ActionButton loading={loading} fullWidth onClick={createRedpacket} disabled={disabled}>
                        {isCreating ?
                            <Trans>Confirming</Trans>
                        :   <Trans>Confirm</Trans>}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </>
    )
}
