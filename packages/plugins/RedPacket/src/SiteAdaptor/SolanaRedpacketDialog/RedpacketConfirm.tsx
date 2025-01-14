import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { RoutePaths } from '@masknet/plugin-redpacket'
import { PluginWalletStatusBar, useCurrentLinkedPersona } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { FireflyRedPacket } from '@masknet/web3-providers'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { Link, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PreviewRedPacket } from '../components/PreviewRedPacket.js'
import { useHandleCreateOrSelect } from '../hooks/useHandleCreateOrSelect.js'
import { useSolRedpacket } from '../contexts/SolRedpacketContext.js'
import { SolanaExplorerResolver } from '../../../../../web3-providers/src/Web3/Solana/apis/ResolverAPI.js'

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
    // assets: {
    //     display: 'flex',
    //     gap: theme.spacing(0.5),
    //     flexFlow: 'row wrap',
    // },
    // asset: {
    //     display: 'flex',
    //     alignItems: 'center',
    //     padding: 2,
    //     gap: theme.spacing(1),
    // },
    // assetName: {
    //     fontSize: 16,
    //     fontWeight: 400,
    //     lineHeight: '20px',
    //     color: theme.palette.maskColor.main,
    // },
    // collectionName: {
    //     maxWidth: 80,
    //     WebkitBoxOrient: 'vertical',
    //     WebkitLineClamp: 2,
    //     overflow: 'hidden',
    //     whiteSpace: 'normal',
    // },
    // tokenIcon: {
    //     width: 24,
    //     height: 24,
    //     marginRight: '0px !important',
    // },
}))

export function SolanaRedPacketConfirm() {
    const { classes, cx } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_SOLANA>()
    const navigate = useNavigate()
    const { settings, shares, isRandom, token, theme, creator, tokenQuantity, nativeToken } = useSolRedpacket()

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
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_SOLANA, { chainId })
    // const wallet = useWallet()
    // const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    // const loading = creatingPubkey || isCreating || isWaitGasBeMinus
    // const disabled = isBalanceInsufficient || loading

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
                            {/* {isBalanceInsufficient ? '0' : formatAvg} {token?.symbol} */}
                            <Link
                                color="textPrimary"
                                className={classes.link}
                                href={SolanaExplorerResolver.fungibleTokenLink(chainId, token?.address ?? '')}
                                // href={EVMExplorerResolver.fungibleTokenLink(chainId, token?.address ?? '')}
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
                    {/* <Typography variant="body1" className={cx(classes.fieldValue, classes.value)}>
                        {formatTotal} {token?.symbol}
                        <Link
                            color="textPrimary"
                            className={classes.link}
                            href={EVMExplorerResolver.fungibleTokenLink(chainId, token?.address ?? '')}
                            target="_blank"
                            rel="noopener noreferrer">
                            <LaunchIcon fontSize="small" />
                        </Link>
                    </Typography> */}
                </div>
                {/* {estimateGasFee && !isZero(estimateGasFee) ?
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
                :   null} */}
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Claim Conditions</Trans>
                    </Typography>
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
                {/* <ActionButton loading={loading} fullWidth onClick={createRedpacket} disabled={disabled}>
                        {isCreating ?
                            <Trans>Confirming</Trans>
                        :   <Trans>Confirm</Trans>}
                    </ActionButton> */}
            </PluginWalletStatusBar>
        </>
    )
}
