import { useEffect, useMemo } from 'react'
import { useAsync } from 'react-use'
import { Icons } from '@masknet/icons'
import { useChainContext, useNativeTokenPrice, useWallet } from '@masknet/web3-hooks-base'
import { type GasConfig, type ChainId } from '@masknet/web3-shared-evm'
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { Grid, Link, Paper, Typography } from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import { PluginWalletStatusBar, ChainBoundary, SelectGasSettingsToolbar } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { EVMChainResolver, EVMExplorerResolver, SmartPayBundler, EVMWeb3 } from '@masknet/web3-providers'
import { isZero } from '@masknet/web3-shared-base'
import { type RedPacketSettings } from './hooks/useCreateCallback.js'
import { useCreateFTRedpacketCallback } from './hooks/useCreateFTRedpacketCallback.js'
import { Trans } from '@lingui/macro'

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

interface ConfirmRedPacketFormProps {
    onCreated: (payload: RedPacketJSONPayload) => void
    onBack: () => void
    onClose: () => void
    settings: RedPacketSettings
    gasOption?: GasConfig
    onGasOptionChange?: (config: GasConfig) => void
    expectedChainId: ChainId
}

export function RedPacketConfirmDialog(props: ConfirmRedPacketFormProps) {
    const { settings, onCreated, onClose, gasOption, onGasOptionChange, expectedChainId } = props
    const { classes, cx } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    useEffect(() => {
        if (settings?.token?.chainId !== chainId) onClose()
    }, [chainId, onClose])

    const { account: publicKey, privateKey = '' } = useMemo(() => EVMWeb3.createAccount(), [])

    const {
        isBalanceInsufficient,
        formatTotal,
        estimateGasFee,
        formatAvg,
        gas,
        isCreating,
        isWaitGasBeMinus,
        createRedpacket,
    } = useCreateFTRedpacketCallback(publicKey, privateKey, settings, gasOption, onCreated, onClose)
    const nativeTokenDetailed = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId])
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const wallet = useWallet()
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

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
                        <Trans>Split Mode</Trans>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textPrimary" align="right">
                        {settings?.isRandom ?
                            <Trans>Random</Trans>
                        :   <Trans>Identical</Trans>}
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body1" color="textSecondary">
                        <Trans>Share</Trans>
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
                                <Trans>Amount per Share</Trans>
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
                                    href={EVMExplorerResolver.fungibleTokenLink(
                                        chainId,
                                        settings?.token?.address ?? '',
                                    )}
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
                        <Trans>Total cost</Trans>
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
                            href={EVMExplorerResolver.fungibleTokenLink(chainId, settings?.token?.address ?? '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}>
                            <LaunchIcon fontSize="small" />
                        </Link>
                        {formatTotal} {settings?.token?.symbol}
                    </Typography>
                </Grid>
                {estimateGasFee && !isZero(estimateGasFee) ?
                    <SelectGasSettingsToolbar
                        nativeToken={nativeTokenDetailed}
                        nativeTokenPrice={nativeTokenPrice}
                        supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
                        gasConfig={gasOption}
                        gasLimit={Number.parseInt(gas ?? '0', 10)}
                        onChange={onGasOptionChange}
                        estimateGasFee={estimateGasFee}
                        editMode
                    />
                :   null}
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
                            <Trans>
                                You can withdraw the rest of your balances back 24h later after sending them out.
                            </Trans>
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
                        {isCreating ?
                            <Trans>Confirming</Trans>
                        :   <Trans>Confirm</Trans>}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </>
    )
}
