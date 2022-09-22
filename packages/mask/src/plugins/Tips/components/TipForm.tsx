import {
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useWeb3State,
    useGasPrice,
    useNativeTokenPrice,
} from '@masknet/plugin-infra/web3'
import { makeStyles, ActionButton } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import {
    ChainId,
    Transaction,
    EIP1559GasConfig,
    PriorEIP1559GasConfig,
    createNativeToken,
} from '@masknet/web3-shared-evm'
import { SelectGasSettingsToolbar } from '@masknet/shared'
import { Box, BoxProps, Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import classnames from 'classnames'
import { FC, memo, useCallback, useMemo, useState } from 'react'
import { PluginWalletStatusBar } from '../../../utils/index.js'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'
import { TargetRuntimeContext, useTip, useTipValidate } from '../contexts/index.js'
import { useI18N } from '../locales/index.js'
import { TipType } from '../types/index.js'
import { NFTSection } from './NFTSection/index.js'
import { RecipientSelect } from './RecipientSelect.js'
import { TokenSection } from './TokenSection/index.js'

const useStyles = makeStyles<{}, 'icon'>()((theme, _, refs) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
        },
        main: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
            padding: theme.spacing(2),
        },
        receiverRow: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        to: {
            fontSize: 19,
            fontWeight: 500,
        },
        address: {
            height: 48,
            flexGrow: 1,
            marginLeft: theme.spacing(1),
        },
        select: {
            display: 'flex',
            alignItems: 'center',
            [`& .${refs.icon}`]: {
                display: 'none',
            },
        },
        menuItem: {
            height: 40,
        },
        icon: {},
        link: {
            display: 'inline-flex',
            alignItems: 'center',
        },
        actionIcon: {
            marginRight: theme.spacing(1),
            color: theme.palette.text.secondary,
        },
        checkIcon: {
            marginLeft: 'auto',
        },
        controls: {
            marginTop: theme.spacing(1),
            display: 'flex',
            flexDirection: 'row',
        },
        addButton: {
            marginLeft: 'auto',
        },
        tokenField: {
            marginTop: theme.spacing(2),
        },
    }
})

interface Props extends BoxProps {
    onAddToken?(): void
    onSent?(): void
}

const GAS_LIMIT = 21000

export const TipForm: FC<Props> = memo(({ className, onAddToken, onSent, ...rest }) => {
    const t = useI18N()
    const currentChainId = useChainId()
    const nativeToken = createNativeToken(currentChainId as ChainId)
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: currentChainId as ChainId,
    })
    const { Others } = useWeb3State<'all'>()
    const pluginId = useCurrentWeb3NetworkPluginID()
    const { value: defaultGasPrice = '1' } = useGasPrice(NetworkPluginID.PLUGIN_EVM)
    const { targetChainId: chainId } = TargetRuntimeContext.useContainer()
    const { classes } = useStyles({})
    const { isSending, sendTip, tipType, setTipType, setGasConfig, gasConfig } = useTip()
    const [isValid, validateMessage] = useTipValidate()
    const [empty, setEmpty] = useState(false)

    const buttonLabel = isSending ? t.sending_tip() : isValid || !validateMessage ? t.send_tip() : validateMessage
    const enabledNft = useMemo(() => {
        if (isSending) return false
        if (chainId !== currentChainId) return false
        if (pluginId === NetworkPluginID.PLUGIN_EVM) {
            return [ChainId.Mainnet, ChainId.BSC, ChainId.Matic].includes(currentChainId as ChainId)
        }
        return pluginId === NetworkPluginID.PLUGIN_SOLANA
    }, [chainId, currentChainId, pluginId])
    const send = useCallback(async () => {
        const hash = await sendTip()
        if (typeof hash !== 'string') return
        onSent?.()
    }, [sendTip, onSent])

    const isEvm = pluginId === NetworkPluginID.PLUGIN_EVM

    return (
        <Box className={classnames(classes.root, className)} {...rest}>
            <div className={classes.main}>
                <FormControl fullWidth className={classes.receiverRow}>
                    <Typography className={classes.to}>{t.tip_to()}</Typography>
                    <RecipientSelect />
                </FormControl>
                <FormControl className={classes.controls}>
                    <RadioGroup row value={tipType} onChange={(e) => setTipType(e.target.value as TipType)}>
                        <FormControlLabel
                            disabled={isSending}
                            value={TipType.Token}
                            control={<Radio />}
                            label={t.tip_type_token()}
                        />
                        <FormControlLabel
                            disabled={!enabledNft}
                            value={TipType.NFT}
                            control={<Radio />}
                            label={t.tip_type_nft()}
                        />
                    </RadioGroup>
                    {tipType === TipType.NFT && !empty && isEvm ? (
                        <Button variant="text" className={classes.addButton} onClick={onAddToken}>
                            {t.tip_add_collectibles()}
                        </Button>
                    ) : null}
                </FormControl>
                {tipType === TipType.Token ? (
                    <FormControl className={classes.tokenField}>
                        <TokenSection />
                    </FormControl>
                ) : (
                    <NFTSection onEmpty={setEmpty} onAddToken={onAddToken} />
                )}
                <SelectGasSettingsToolbar
                    nativeToken={nativeToken}
                    nativeTokenPrice={nativeTokenPrice}
                    transaction={gasConfig}
                    onChange={(tx: Transaction) => {
                        setGasConfig(
                            Others?.chainResolver.isSupport(chainId, 'EIP1559')
                                ? {
                                      gas: GAS_LIMIT,
                                      maxFeePerGas:
                                          (tx.maxFeePerGas as string) ||
                                          (gasConfig as EIP1559GasConfig)?.maxFeePerGas ||
                                          defaultGasPrice,
                                      maxPriorityFeePerGas:
                                          (tx.maxPriorityFeePerGas as string) ||
                                          (gasConfig as EIP1559GasConfig)?.maxPriorityFeePerGas ||
                                          '1',
                                  }
                                : {
                                      gas: GAS_LIMIT,
                                      gasPrice:
                                          (tx.gasPrice as string) ||
                                          (gasConfig as PriorEIP1559GasConfig)?.gasPrice ||
                                          defaultGasPrice,
                                  },
                        )
                    }}
                />
            </div>

            <PluginWalletStatusBar>
                <ChainBoundary
                    expectedPluginID={
                        [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginId)
                            ? pluginId
                            : NetworkPluginID.PLUGIN_EVM
                    }
                    expectedChainId={chainId}
                    noSwitchNetworkTip
                    ActionButtonPromiseProps={{
                        fullWidth: true,
                    }}>
                    <ActionButton fullWidth disabled={!isValid || isSending} onClick={send}>
                        {buttonLabel}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </Box>
    )
})
