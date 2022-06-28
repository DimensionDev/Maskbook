import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { chainResolver, explorerResolver, isNativeTokenAddress, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { Grid, Link, Paper, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import LaunchIcon from '@mui/icons-material/Launch'
import { FormattedBalance, useOpenShareTxDialog } from '@masknet/shared'
import { useI18N } from '../locales'
import { RedPacketSettings, useCreateCallback } from './hooks/useCreateCallback'
import { useAccount, useChainId, useNetworkType, useWeb3 } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, formatBalance } from '@masknet/web3-shared-base'
import type { RedPacketJSONPayload, RedPacketRecord } from '../types'
import { RedPacketRPC } from '../messages'
import { PluginWalletStatusBar } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

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
        fontSize: 14,
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
    data: {
        textAlign: 'right',
        color: theme.palette.text.primary,
    },
    label: {
        textAlign: 'left',
        color: theme.palette.text.secondary,
    },
    button: {
        padding: theme.spacing(2),
    },
    gasEstimation: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        cursor: 'pointer',
        '& > p': {
            marginRight: 5,
            color: theme.palette.mode === 'light' ? '#7B8192' : '#6F767C',
        },
    },
    ellipsis: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}))

export interface ConfirmRedPacketFormProps {
    onBack: () => void
    onCreated: (payload: RedPacketJSONPayload) => void
    onClose: () => void
    settings?: RedPacketSettings
}

export function RedPacketConfirmDialog(props: ConfirmRedPacketFormProps) {
    const t = useI18N()
    const { onBack, settings, onCreated, onClose } = props
    const { classes } = useStyles()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    useEffect(() => {
        if (settings?.token?.chainId !== chainId) onClose()
    }, [chainId, onClose])

    // #region blocking
    // password should remain the same rather than change each time when createState change,
    //  otherwise password in database would be different from creating red-packet.
    const contract_version = 4
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const networkType = useNetworkType(NetworkPluginID.PLUGIN_EVM)
    const { address: publicKey, privateKey } = useMemo(
        () => web3?.eth.accounts.create() ?? { address: '', privateKey: '' },
        [web3],
    )!
    const [{ loading: isCreating }, createCallback] = useCreateCallback(settings!, contract_version, publicKey)
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

        const CreationSuccess = (events?.CreationSuccess.returnValues ?? {}) as {
            creation_time: string
            creator: string
            id: string
            token_address: string
            total: string
        }
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
            id: receipt.transactionHash!,
            from: '',
            password: privateKey,
            contract_version,
        }
        RedPacketRPC.discoverRedPacket(record, chainId)

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
        payload.current.network = chainResolver.chainName(chainId)
    }, [chainId, networkType, contract_version])

    return (
        <>
            <Grid container spacing={2} className={classNames(classes.grid, classes.gridWrapper)}>
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
                        {isNativeTokenAddress(settings?.token) ? null : (
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

                {settings?.isRandom ? null : (
                    <>
                        <Grid item xs={6}>
                            <Typography variant="body1" color="textSecondary">
                                {t.amount_per_share()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1" color="textPrimary" align="right">
                                <FormattedBalance
                                    value={new BigNumber(settings?.total ?? 0).div(settings?.shares ?? 1)}
                                    decimals={settings?.token?.decimals}
                                    symbol={settings?.token?.symbol}
                                    formatter={formatBalance}
                                />
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
                        <FormattedBalance
                            value={settings?.total}
                            decimals={settings?.token?.decimals!}
                            symbol={settings?.token?.symbol!}
                            formatter={formatBalance}
                        />
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Paper className={classes.hit}>
                        <Typography variant="body1" align="center" style={{ fontSize: 14, lineHeight: '20px' }}>
                            {t.hint()}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
            <PluginWalletStatusBar>
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                    <ActionButton loading={isCreating} fullWidth onClick={createRedpacket}>
                        {t.send_symbol({
                            amount: formatBalance(settings?.total, settings?.token?.decimals ?? 0),
                            symbol: settings?.token?.symbol ?? '-',
                        })}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </>
    )
}
