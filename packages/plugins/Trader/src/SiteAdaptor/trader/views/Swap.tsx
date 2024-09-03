import { makeStyles } from '@masknet/theme'
import { NetworkIcon, PluginWalletStatusBar, SelectFungibleTokenModal, TokenIcon } from '@masknet/shared'
import { Box, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useChainContext, useNativeToken, useNetworks } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { base } from '../../../base.js'
import { useState } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useSupportedChains } from '../hooks/useSupportedChains.js'

const useStyles = makeStyles()((theme) => ({
    view: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        minHeight: 0,
        flexGrow: 1,
        overflow: 'auto',
    },
    box: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        padding: theme.spacing(1.5),
        borderRadius: 12,
        display: 'flex',
        gap: theme.spacing(1),
    },
    token: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        cursor: 'pointer',
    },
    icon: {
        position: 'relative',
        width: 30,
        height: 30,
    },
    tokenIcon: {
        height: 30,
        width: 30,
    },
    badgeIcon: {
        position: 'absolute',
        right: -3,
        bottom: -2,
    },
    symbol: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    chain: {
        fontSize: 13,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
    tokenInput: {
        height: '100%',
        width: '100%',
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        textAlign: 'right',
    },
    tokenValue: {
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    lost: {
        color: theme.palette.maskColor.danger,
        marginLeft: theme.spacing(0.5),
    },
    footer: {
        flexShrink: 0,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
    },
}))

const chainIds = base.enableRequirement.web3[NetworkPluginID.PLUGIN_EVM].supportedChainIds
export function SwapView() {
    const { classes } = useStyles()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    const { chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const chainId = chainIds.includes(contextChainId) ? contextChainId : ChainId.Mainnet
    console.log({ chainId })
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const [fromToken = nativeToken, setFromToken] = useState<Web3Helper.FungibleTokenAll | null>()
    const [toToken, setToToken] = useState<Web3Helper.FungibleTokenAll | null>()
    const fromNetwork = networks.find((x) => x.chainId === fromToken?.chainId)
    const toNetwork = networks.find((x) => x.chainId === toToken?.chainId)
    const chainQuery = useSupportedChains()

    const pickToken = async (currentToken?: Web3Helper.FungibleTokenAll | null) => {
        const supportedChains = chainQuery.data ?? (await chainQuery.refetch()).data
        return SelectFungibleTokenModal.openAndWaitForClose({
            disableNativeToken: false,
            selectedTokens: currentToken ? [currentToken.address] : [],
            // Only from token can decide the chain
            chainId: fromToken?.chainId || chainId,
            pluginID: NetworkPluginID.PLUGIN_EVM,
            chains: supportedChains?.map((x) => Number.parseInt(x.chainId, 10)),
            okxOnly: true,
            lockChainId: !!fromToken?.chainId,
        })
    }

    return (
        <div className={classes.view}>
            <Box className={classes.container}>
                <Box className={classes.box}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography lineHeight="18px" fontWeight="700" fontSize="14px">
                            From
                        </Typography>
                        <Box display="flex" flexDirection="row">
                            <Box
                                className={classes.token}
                                onClick={async () => {
                                    const picked = await pickToken(fromToken)
                                    if (picked) setFromToken(picked)
                                }}>
                                <Box className={classes.icon}>
                                    <TokenIcon
                                        className={classes.tokenIcon}
                                        chainId={fromToken?.chainId}
                                        address={fromToken?.address || ''}
                                        logoURL={fromToken?.logoURL}
                                    />
                                    {fromToken ?
                                        <NetworkIcon
                                            pluginID={NetworkPluginID.PLUGIN_EVM}
                                            className={classes.badgeIcon}
                                            chainId={fromToken?.chainId}
                                            size={12}
                                        />
                                    :   null}
                                </Box>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="strong" className={classes.symbol}>
                                        {fromToken?.name ?? '--'}
                                    </Typography>
                                    <Typography component="span" className={classes.chain}>
                                        on {fromNetwork?.name ?? '--'}
                                    </Typography>
                                </Box>
                                <Icons.ArrowDrop size={16} />
                            </Box>
                        </Box>
                    </Box>
                    <Box flexGrow={1}>
                        <Box height="100%" position="relative">
                            <input className={classes.tokenInput} autoFocus />
                            <Typography className={classes.tokenValue}>$10M</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box className={classes.box}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography lineHeight="18px" fontWeight="700" fontSize="14px">
                            To
                        </Typography>
                        <Box display="flex" flexDirection="row">
                            <Box
                                className={classes.token}
                                onClick={async () => {
                                    const picked = await pickToken(toToken)
                                    if (picked) setToToken(picked)
                                }}>
                                <Box className={classes.icon}>
                                    <TokenIcon
                                        className={classes.tokenIcon}
                                        chainId={toToken?.chainId}
                                        address={toToken?.address || ''}
                                        logoURL={toToken?.logoURL}
                                    />
                                    {toToken ?
                                        <NetworkIcon
                                            pluginID={NetworkPluginID.PLUGIN_EVM}
                                            className={classes.badgeIcon}
                                            chainId={toToken.chainId}
                                            size={12}
                                        />
                                    :   null}
                                </Box>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="strong" className={classes.symbol}>
                                        {toToken?.symbol ?? '--'}
                                    </Typography>
                                    <Typography component="span" className={classes.chain}>
                                        on {toNetwork?.name ?? '--'}
                                    </Typography>
                                </Box>
                                <Icons.ArrowDrop size={16} />
                            </Box>
                        </Box>
                    </Box>
                    <Box flexGrow={1}>
                        <Box height="100%" position="relative">
                            <input className={classes.tokenInput} />
                            <Typography className={classes.tokenValue}>
                                $10M
                                <span className={classes.lost}>(-10.00%)</span>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <PluginWalletStatusBar className={classes.footer} requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM} />
        </div>
    )
}
