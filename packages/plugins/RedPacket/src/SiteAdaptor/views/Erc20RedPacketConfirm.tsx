import { Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { RoutePaths } from '@masknet/plugin-redpacket'
import {
    ChainBoundary,
    PluginWalletStatusBar,
    SelectGasSettingsToolbar,
    useCurrentLinkedPersona,
} from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useNativeTokenPrice, useWallet } from '@masknet/web3-hooks-base'
import { EVMChainResolver, EVMExplorerResolver, FireflyRedPacket, SmartPayBundler } from '@masknet/web3-providers'
import { isZero } from '@masknet/web3-shared-base'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { Link, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
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

export function Erc20RedPacketConfirm() {
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const navigate = useNavigate()
    const { settings, theme, creator, gasOption, setGasOption } = useRedPacket()

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
        queryKey: ['red-packet', 'create-pubkey', themeId, creator],
        queryFn: async () => {
            if (!themeId) return null
            // TODO: StrategyPayload list
            return FireflyRedPacket.createPublicKey(themeId, creator, EMPTY_LIST)
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
    } = useCreateFTRedpacketCallback(
        publicKey ?? '',
        // TODO get rid of privateKey since we don't need it anymore
        '',
        settings!,
        gasOption,
        handleCreated,
        onClose,
    )

    const nativeTokenDetailed = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId])
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const wallet = useWallet()
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    return (
        <>
            <div className={classes.settings}>
                <Typography variant="h4" color="textPrimary" align="center" className={classes.message}>
                    {settings?.message}
                </Typography>
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Split Mode</Trans>
                    </Typography>
                    <Typography variant="body1" className={classes.fieldValue}>
                        {settings?.isRandom ?
                            <Trans>Random</Trans>
                        :   <Trans>Identical</Trans>}
                    </Typography>
                </div>
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Share</Trans>
                    </Typography>
                    <Typography variant="body1" className={classes.fieldValue}>
                        {settings?.shares}
                    </Typography>
                </div>
                {settings?.isRandom ? null : (
                    <div className={classes.field}>
                        <Typography className={classes.fieldName}>
                            <Trans>Amount per Share</Trans>
                        </Typography>
                        <Typography variant="body1" className={classes.fieldValue}>
                            {isBalanceInsufficient ? '0' : formatAvg} {settings?.token?.symbol}
                            <Link
                                color="textPrimary"
                                className={classes.link}
                                href={EVMExplorerResolver.fungibleTokenLink(chainId, settings?.token?.address ?? '')}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stop}>
                                <LaunchIcon fontSize="small" />
                            </Link>
                        </Typography>
                    </div>
                )}
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Total cost</Trans>
                    </Typography>
                    <Typography variant="body1" className={classes.fieldValue}>
                        {formatTotal} {settings?.token?.symbol}
                        <Link
                            color="textPrimary"
                            className={classes.link}
                            href={EVMExplorerResolver.fungibleTokenLink(chainId, settings?.token?.address ?? '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}>
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
                            supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
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
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                    <ActionButton
                        loading={creatingPubkey || isCreating || isWaitGasBeMinus}
                        fullWidth
                        onClick={createRedpacket}
                        disabled={isBalanceInsufficient || isWaitGasBeMinus || isCreating}>
                        {isCreating ?
                            <Trans>Confirming</Trans>
                        :   <Trans>Confirm</Trans>}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </>
    )
}
