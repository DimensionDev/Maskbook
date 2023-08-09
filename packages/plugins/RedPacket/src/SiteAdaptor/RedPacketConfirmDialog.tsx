import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAsync } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { Icons } from '@masknet/icons'
import {
    useChainContext,
    useBalance,
    useNativeToken,
    useNativeTokenAddress,
    useNativeTokenPrice,
    useWallet,
} from '@masknet/web3-hooks-base'
import { type GasConfig, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { type RedPacketRecord, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { Grid, Link, Paper, Typography } from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import { PluginWalletStatusBar, ChainBoundary, SelectGasSettingsToolbar } from '@masknet/shared'
import { useTransactionValue } from '@masknet/web3-hooks-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { ChainResolver, ExplorerResolver, SmartPayBundler, Web3 } from '@masknet/web3-providers'
import { formatBalance, isSameAddress, isZero } from '@masknet/web3-shared-base'
import { type RedPacketSettings, useCreateCallback, useCreateParams } from './hooks/useCreateCallback.js'
import { useI18N } from '../locales/index.js'
import { RedPacketRPC } from '../messages.js'

const useStyles = makeStyles()((theme) => ({
    link: {
        display: 'flex',
        marginLeft: theme.spacing(0.5),
    },
    grid: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    gridWrapper: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
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
        marginTop: 0,
        marginBottom: 130,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    ellipsis: {
        fontSize: 24,
        fontWeight: 700,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    controller: {
        position: 'sticky',
        bottom: 0,
    },
}))

export interface ConfirmRedPacketFormProps {
    onCreated: (payload: RedPacketJSONPayload) => void
    onBack: () => void
    onClose: () => void
    settings?: RedPacketSettings
    gasOption?: GasConfig
    onGasOptionChange?: (config: GasConfig) => void
}

export function RedPacketConfirmDialog(props: ConfirmRedPacketFormProps) {
    const t = useI18N()
    const { settings, onCreated, onClose, gasOption, onGasOptionChange } = props
    const { classes, cx } = useStyles()
    const { isLoading: loadingBalance } = useBalance(NetworkPluginID.PLUGIN_EVM)
    const { account, chainId, networkType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    useEffect(() => {
        if (settings?.token?.chainId !== chainId) onClose()
    }, [chainId, onClose])

    // #region blocking
    // password should remain the same rather than change each time when createState change,
    //  otherwise password in database would be different from creating red-packet.
    const contract_version = 4

    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { account: publicKey, privateKey = '' } = useMemo(() => Web3.createAccount(), [])
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })

    // #region amount minus estimate gas fee
    const { value: createParams } = useCreateParams(settings!, contract_version, publicKey)
    const isNativeToken = isSameAddress(settings?.token?.address, nativeTokenAddress)
    const { transactionValue, estimateGasFee } = useTransactionValue(
        settings?.total,
        createParams?.gas,
        gasOption?.gasCurrency,
    )
    const isWaitGasBeMinus = (!estimateGasFee || loadingBalance) && isNativeToken

    const isBalanceInsufficient =
        isSameAddress(gasOption?.gasCurrency, nativeToken?.address) &&
        new BigNumber(transactionValue).isLessThanOrEqualTo(0)
    const total = isNativeToken ? (isBalanceInsufficient ? '0' : transactionValue) : (settings?.total as string)
    const formatTotal = formatBalance(total, settings?.token?.decimals ?? 18, isNativeToken ? 3 : 0)
    const formatAvg = formatBalance(
        new BigNumber(total).div(settings?.shares ?? 1).toFixed(0, 1),
        settings?.token?.decimals ?? 18,
        isNativeToken ? 3 : 0,
    )
    const [{ loading: isCreating }, createCallback] = useCreateCallback(
        { ...settings!, total },
        contract_version,
        publicKey,
        gasOption,
    )
    // #endregion
    const createRedpacket = useCallback(async () => {
        const result = await createCallback()
        const { hash, receipt, events } = result ?? {}
        if (typeof hash !== 'string') return
        if (typeof receipt?.transactionHash !== 'string') return

        // the settings is not available
        if (!settings?.token) return

        const CreationSuccess = (events?.CreationSuccess?.returnValues ?? {}) as {
            creation_time: string
            creator: string
            id: string
            token_address: string
            total: string
        }

        // the events log is not available
        if (!events?.CreationSuccess?.returnValues.id) return

        payload.current.sender = {
            address: account,
            name: settings.name,
            message: settings.message,
        }
        payload.current.is_random = settings.isRandom
        payload.current.shares = settings.shares
        payload.current.password = privateKey
        payload.current.rpid = CreationSuccess.id
        payload.current.total = CreationSuccess.total
        payload.current.duration = settings.duration
        payload.current.creation_time = Number.parseInt(CreationSuccess.creation_time, 10) * 1000
        payload.current.token = settings.token

        const record: RedPacketRecord = {
            id: receipt.transactionHash,
            from: '',
            password: privateKey,
            contract_version,
        }
        RedPacketRPC.addRedPacket(record, chainId)

        // output the redpacket as JSON payload
        onCreated(payload.current)
    }, [createCallback, settings, onCreated])
    // #endregion

    // assemble JSON payload
    const payload = useRef<RedPacketJSONPayload>({
        network: ChainResolver.chainName(chainId),
    } as RedPacketJSONPayload)

    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)

    useEffect(() => {
        const contractAddress = HAPPY_RED_PACKET_ADDRESS_V4
        if (!contractAddress) {
            onClose()
            return
        }
        payload.current.contract_address = contractAddress
        payload.current.contract_version = contract_version
        payload.current.network = ChainResolver.networkType(chainId)
    }, [chainId, networkType, contract_version])

    const nativeTokenDetailed = useMemo(() => ChainResolver.nativeCurrency(chainId), [chainId])
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const wallet = useWallet()
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])
    const { value: params } = useCreateParams(settings!, contract_version, publicKey)

    return (
        <>
            <Grid container spacing={2} className={cx(classes.grid, classes.gridWrapper)}>
                <Grid item xs={12}>
                    <Typography variant="h4" color="textPrimary" align="center" className={classes.ellipsis}>
                        {settings?.message}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textSecondary">
                        {t.split_mode()}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textPrimary" align="right">
                        {settings?.isRandom ? t.random() : t.average()}
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body1" color="textSecondary">
                        {t.share()}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textPrimary" align="right">
                        {settings?.shares}
                    </Typography>
                </Grid>

                {settings?.isRandom ? null : (
                    <>
                        <Grid item xs={6}>
                            <Typography variant="body1" color="textSecondary">
                                {t.amount_per_share()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography
                                variant="body1"
                                color="textPrimary"
                                align="right"
                                display="flex"
                                alignItems="center"
                                flexDirection="row-reverse">
                                <Link
                                    color="textPrimary"
                                    className={classes.link}
                                    href={ExplorerResolver.fungibleTokenLink(chainId, settings?.token?.address ?? '')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={stop}>
                                    <LaunchIcon fontSize="small" />
                                </Link>
                                {isBalanceInsufficient ? '0' : formatAvg} {settings?.token?.symbol}
                            </Typography>
                        </Grid>
                    </>
                )}

                <Grid item xs={6}>
                    <Typography variant="body1" color="textSecondary">
                        {t.total_cost()}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography
                        variant="body1"
                        color="textPrimary"
                        align="right"
                        display="flex"
                        alignItems="center"
                        flexDirection="row-reverse">
                        <Link
                            color="textPrimary"
                            className={classes.link}
                            href={ExplorerResolver.fungibleTokenLink(chainId, settings?.token?.address ?? '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}>
                            <LaunchIcon fontSize="small" />
                        </Link>
                        {formatTotal} {settings?.token?.symbol}
                    </Typography>
                </Grid>
                {estimateGasFee && !isZero(estimateGasFee) ? (
                    <SelectGasSettingsToolbar
                        nativeToken={nativeTokenDetailed}
                        nativeTokenPrice={nativeTokenPrice}
                        supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
                        gasConfig={gasOption}
                        gasLimit={Number.parseInt(params?.gas ?? '0', 10)}
                        onChange={onGasOptionChange}
                        estimateGasFee={estimateGasFee}
                        editMode
                    />
                ) : null}
                <Grid item xs={12}>
                    <Paper className={classes.hit}>
                        <Icons.SettingInfo size={20} />
                        <Typography
                            variant="body1"
                            align="left"
                            marginTop="1px"
                            marginLeft="8.5px"
                            style={{ lineHeight: '18px' }}
                            fontSize="14px">
                            {t.hint()}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
            <PluginWalletStatusBar className={classes.controller}>
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                    <ActionButton
                        loading={isCreating || isWaitGasBeMinus}
                        fullWidth
                        onClick={createRedpacket}
                        disabled={isBalanceInsufficient || isWaitGasBeMinus || isCreating}>
                        {isCreating ? t.confirming() : t.confirm()}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </>
    )
}
