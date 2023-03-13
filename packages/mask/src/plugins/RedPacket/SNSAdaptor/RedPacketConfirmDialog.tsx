import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useChainContext, useBalance, useWeb3, useNativeToken, useNativeTokenAddress } from '@masknet/web3-hooks-base'
import {
    chainResolver,
    explorerResolver,
    type GasConfig,
    isNativeTokenAddress,
    useRedPacketConstants,
} from '@masknet/web3-shared-evm'
import { Grid, Link, Paper, Typography } from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { FormattedBalance, useOpenShareTxDialog, PluginWalletStatusBar, ChainBoundary } from '@masknet/shared'
import { useI18N } from '../locales/index.js'
import { type RedPacketSettings, useCreateCallback, useCreateParams } from './hooks/useCreateCallback.js'
import { useTransactionValue } from '@masknet/web3-hooks-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatBalance, isSameAddress } from '@masknet/web3-shared-base'
import type { RedPacketJSONPayload, RedPacketRecord } from '../types.js'
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
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    hit: {
        fontWeight: 300,
        borderRadius: 8,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        padding: theme.spacing(1.2),
        marginBottom: theme.spacing(1),
    },
    token: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    ellipsis: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}))

export interface ConfirmRedPacketFormProps {
    onCreated: (payload: RedPacketJSONPayload) => void
    onBack: () => void
    onClose: () => void
    settings?: RedPacketSettings
    gasOption?: GasConfig
}

export function RedPacketConfirmDialog(props: ConfirmRedPacketFormProps) {
    const t = useI18N()
    const { onBack, settings, onCreated, onClose, gasOption } = props
    const { classes, cx } = useStyles()
    const { value: balance = '0', loading: loadingBalance } = useBalance(NetworkPluginID.PLUGIN_EVM)
    const { account, chainId, networkType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    useEffect(() => {
        if (settings?.token?.chainId !== chainId) onClose()
    }, [chainId, onClose])

    // #region blocking
    // password should remain the same rather than change each time when createState change,
    //  otherwise password in database would be different from creating red-packet.
    const contract_version = 4
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM)
    const { address: publicKey, privateKey } = useMemo(
        () => web3?.eth.accounts.create() ?? { address: '', privateKey: '' },
        [web3],
    )!
    const { value: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)

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
        new BigNumber(total).div(settings?.shares ?? 1),
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
    const openShareTxDialog = useOpenShareTxDialog()
    const createRedpacket = useCallback(async () => {
        const result = await createCallback()

        const { hash, receipt, events } = result ?? {}
        if (typeof hash !== 'string') return
        if (typeof receipt?.transactionHash !== 'string') return
        await openShareTxDialog({
            hash: receipt.transactionHash,
        })

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
    }, [createCallback, settings, openShareTxDialog, onCreated])
    // #endregion

    // assemble JSON payload
    const payload = useRef<RedPacketJSONPayload>({
        network: chainResolver.chainName(chainId),
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
        payload.current.network = chainResolver.networkType(chainId)
    }, [chainId, networkType, contract_version])

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
                        {t.token()}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textPrimary" align="right" className={classes.token}>
                        <span>{settings?.token?.symbol}</span>
                        {isNativeTokenAddress(settings?.token?.address) ? null : (
                            <Link
                                color="textPrimary"
                                className={classes.link}
                                href={explorerResolver.fungibleTokenLink(chainId, settings?.token?.address ?? '')}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stop}>
                                <LaunchIcon fontSize="small" />
                            </Link>
                        )}
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
                        {t.shares()}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textPrimary" align="right">
                        {settings?.shares}
                    </Typography>
                </Grid>

                {!estimateGasFee ? null : (
                    <>
                        <Grid item xs={6}>
                            <Typography variant="body1" color="textSecondary">
                                {t.estimate_gas_fee()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1" color="textPrimary" align="right">
                                <FormattedBalance
                                    value={estimateGasFee}
                                    decimals={nativeToken?.decimals}
                                    symbol={nativeToken?.symbol}
                                    formatter={formatBalance}
                                    significant={isNativeToken ? 3 : 0}
                                />
                            </Typography>
                        </Grid>
                    </>
                )}

                {settings?.isRandom ? null : (
                    <>
                        <Grid item xs={6}>
                            <Typography variant="body1" color="textSecondary">
                                {t.amount_per_share()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1" color="textPrimary" align="right">
                                {isBalanceInsufficient ? '0' : formatAvg} {settings?.token?.symbol}
                            </Typography>
                        </Grid>
                    </>
                )}

                <Grid item xs={6}>
                    <Typography variant="body1" color="textSecondary">
                        {t.total_amount()}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textPrimary" align="right">
                        {formatTotal} {settings?.token?.symbol}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Paper className={classes.hit}>
                        <Typography variant="body1" align="left" style={{ lineHeight: '20px' }}>
                            {t.hint()}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
            <PluginWalletStatusBar>
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                    <ActionButton
                        loading={isCreating || isWaitGasBeMinus}
                        fullWidth
                        onClick={createRedpacket}
                        disabled={isBalanceInsufficient || isWaitGasBeMinus || isCreating}>
                        {!isBalanceInsufficient
                            ? t.token_send_symbol({
                                  amount: formatTotal,
                                  symbol: settings?.token?.symbol ?? '-',
                              })
                            : t.insufficient_balance()}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </>
    )
}
