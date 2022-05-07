import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
    formatBalance,
    getChainName,
    isNativeTokenAddress,
    resolveTokenLinkOnExplorer,
    TransactionStateType,
    useAccount,
    useChainId,
    useNetworkType,
    useRedPacketConstants,
    useWeb3,
} from '@masknet/web3-shared-evm'
import { Grid, Link, Paper, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import LaunchIcon from '@mui/icons-material/Launch'
import { FormattedBalance, useOpenShareTxDialog } from '@masknet/shared'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import { RedPacketSettings, useCreateCallback } from './hooks/useCreateCallback'
import type { RedPacketJSONPayload, RedPacketRecord } from '../types'
import { RedPacketRPC } from '../messages'

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
    const { t } = useI18N()
    const { onBack, settings, onClose, onCreated } = props
    const { classes } = useStyles()
    const chainId = useChainId()

    useEffect(() => {
        if (settings?.token?.chainId !== chainId) onClose()
    }, [chainId, onClose])

    // #region blocking
    // password should remain the same rather than change each time when createState change,
    //  otherwise password in database would be different from creating red-packet.
    const contract_version = 4
    const web3 = useWeb3()
    const account = useAccount()
    const { address: publicKey, privateKey } = useMemo(() => web3.eth.accounts.create(), [])
    const [createState, createCallback, resetCreateCallback] = useCreateCallback(settings!, contract_version, publicKey)
    const isCreating = [
        TransactionStateType.WAIT_FOR_CONFIRMING,
        TransactionStateType.HASH,
        TransactionStateType.RECEIPT,
    ].includes(createState.type)
    const openShareTxDialog = useOpenShareTxDialog()
    const createRedpacket = useCallback(async () => {
        const receipt = await createCallback()
        if (!receipt?.transactionHash) return
        await openShareTxDialog({
            hash: receipt.transactionHash,
        })
        // reset state
        resetCreateCallback()

        // the settings is not available
        if (!settings?.token) return

        const CreationSuccess = (receipt.events?.CreationSuccess.returnValues ?? {}) as {
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

        // output the redpacket as JSON payload
        onCreated(payload.current)
    }, [createCallback, resetCreateCallback, settings, openShareTxDialog, onCreated])
    // #endregion

    // assemble JSON payload
    const payload = useRef<RedPacketJSONPayload>({
        network: getChainName(chainId),
    } as RedPacketJSONPayload)

    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants()
    const networkType = useNetworkType()
    useEffect(() => {
        if (createState.type !== TransactionStateType.UNKNOWN) return
        const contractAddress = HAPPY_RED_PACKET_ADDRESS_V4
        if (!contractAddress) {
            onClose()
            return
        }
        payload.current.contract_address = contractAddress
        payload.current.contract_version = contract_version
        payload.current.network = getChainName(chainId)
    }, [chainId, networkType, contract_version, createState])

    useEffect(() => {
        if (!settings?.token || createState.type === TransactionStateType.UNKNOWN) return

        // storing the created red packet in DB, it helps retrieve red packet password later
        // save to the database early, otherwise red-packet would lose when close the tx dialog or
        //  web page before create successfully.
        if (createState.type === TransactionStateType.HASH && createState.hash) {
            payload.current.txid = createState.hash
            const record: RedPacketRecord = {
                id: createState.hash!,
                from: '',
                password: privateKey,
                contract_version,
            }
            RedPacketRPC.discoverRedPacket(record)
        }
    }, [createState /* update tx dialog only if state changed */])
    // #endregion

    return (
        <Grid container spacing={2} className={classNames(classes.grid, classes.gridWrapper)}>
            <Grid item xs={12}>
                <Typography variant="h4" color="textPrimary" align="center" className={classes.ellipsis}>
                    {settings?.message}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textSecondary">
                    {t('plugin_red_packet_token')}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textPrimary" align="right" className={classes.token}>
                    <span>{settings?.token?.symbol}</span>
                    {isNativeTokenAddress(settings?.token) ? null : (
                        <Link
                            color="textPrimary"
                            className={classes.link}
                            href={resolveTokenLinkOnExplorer(settings?.token!)}
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
                    {t('plugin_red_packet_split_mode')}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textPrimary" align="right">
                    {settings?.isRandom ? t('plugin_red_packet_random') : t('plugin_red_packet_average')}
                </Typography>
            </Grid>

            <Grid item xs={6}>
                <Typography variant="body1" color="textSecondary">
                    {t('plugin_red_packet_shares')}
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
                            {t('plugin_red_packet_amount_per_share')}
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
                    {t('plugin_red_packet_amount_total')}
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
                        {t('plugin_red_packet_hint')}
                    </Typography>
                </Paper>
            </Grid>

            <Grid item xs={6}>
                <ActionButton disabled={isCreating} variant="contained" size="large" fullWidth onClick={onBack}>
                    {t('plugin_red_packet_back')}
                </ActionButton>
            </Grid>
            <Grid item xs={6}>
                <ActionButton loading={isCreating} variant="contained" size="large" fullWidth onClick={createRedpacket}>
                    {t('plugin_red_packet_send_symbol', {
                        amount: formatBalance(settings?.total, settings?.token?.decimals ?? 0),
                        symbol: settings?.token?.symbol,
                    })}
                </ActionButton>
            </Grid>
        </Grid>
    )
}
