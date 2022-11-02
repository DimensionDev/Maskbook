import { useEffect, useRef, useState } from 'react'
import { PluginID, NetworkPluginID, isDashboardPage, CrossIsolationMessages } from '@masknet/shared-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import {
    Web3ContextProvider,
    useChainContext,
    useChainIdValid,
    useNetworkContext,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import { DialogContent, dialogTitleClasses, IconButton } from '@mui/material'
import { InjectedDialog, useSelectAdvancedSettings, NetworkTab } from '@masknet/shared'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { PluginTraderMessages } from '../../messages.js'
import { Trader, TraderRef, TraderProps } from './Trader.js'
import { useI18N } from '../../../../utils/index.js'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { currentSlippageSettings } from '../../settings.js'
import { MIN_GAS_LIMIT } from '../../constants/index.js'
import { useAsyncFn } from 'react-use'
import { SchemaType, Transaction } from '@masknet/web3-shared-evm'

const isDashboard = isDashboardPage()

const useStyles = makeStyles()((theme) => ({
    abstractTabWrapper: {
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 2,

        '& > div .MuiBox-root': isDashboard
            ? {
                  background: MaskColorVar.mainBackground,
              }
            : {},
    },
    indicator: {
        display: 'none',
    },
    content: {
        padding: 0,
        minHeight: 560,
        display: 'flex',
        flexDirection: 'column',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tradeRoot: {},
    tail: {
        display: 'flex',
        gap: 8,
        '& > button': {
            padding: 0,
            width: 24,
            height: 24,
        },
    },
    icon: {
        color: theme.palette.maskColor.main,
        cursor: 'pointer',
    },
    dialog: {
        [`.${dialogTitleClasses.root}`]: {
            // 'row !important' is not assignable to FlexDirection
            flexDirection: 'row !important' as 'row',
            '& > p': {
                justifyContent: 'center !important',
            },
        },
    },
}))

export function TraderDialog() {
    const tradeRef = useRef<TraderRef>(null)
    const traderDefinition = useActivatedPlugin(PluginID.Trader, 'any')
    const { pluginID } = useNetworkContext()
    const { Others } = useWeb3State()
    const chainIdList = traderDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? []
    const { t } = useI18N()
    const { classes } = useStyles()

    const { chainId } = useChainContext()
    const chainIdValid = useChainIdValid(pluginID, chainId)

    const [traderProps, setTraderProps] = useState<TraderProps>()
    const chainIdRef = useRef(chainId)
    const [open, setOpen] = useState(false)

    const selectAdvancedSettings = useSelectAdvancedSettings()

    // #region update default input or output token
    useEffect(() => {
        chainIdRef.current = chainId
    }, [chainId])

    useEffect(() => {
        return CrossIsolationMessages.events.swapDialogEvent.on(({ open, traderProps }) => {
            setOpen(open)
            if (traderProps && Others) {
                const { defaultInputCoin, defaultOutputCoin } = traderProps
                const inputToken = defaultInputCoin
                    ? Others.isNativeTokenAddress(defaultInputCoin.address)
                        ? Others.createNativeToken(chainIdRef.current)
                        : Others.createFungibleToken(
                              chainIdRef.current,
                              SchemaType.ERC20,
                              defaultInputCoin.address,
                              defaultInputCoin.name,
                              defaultInputCoin.symbol,
                              defaultInputCoin.decimals,
                          )
                    : undefined
                const outputToken = defaultOutputCoin
                    ? Others.isNativeTokenAddress(defaultOutputCoin.address)
                        ? Others.createNativeToken(chainIdRef.current)
                        : Others.createFungibleToken(
                              chainIdRef.current,
                              SchemaType.ERC20,
                              defaultOutputCoin.address,
                              defaultOutputCoin.name,
                              defaultOutputCoin.symbol,
                              defaultOutputCoin.decimals,
                          )
                    : undefined

                setTraderProps({
                    defaultInputCoin: inputToken,
                    defaultOutputCoin: outputToken,
                    chainId: traderProps.chainId,
                })
            }
        })
    }, [chainId, Others])
    // #endregion

    useEffect(() => {
        if (!chainIdValid) setOpen(false)
    }, [chainIdValid])

    const [, openGasSettingDialog] = useAsyncFn(async () => {
        const { slippageTolerance, transaction } = await selectAdvancedSettings({
            chainId,
            disableGasLimit: true,
            disableSlippageTolerance: false,
            transaction: {
                gas: tradeRef.current?.focusedTrade?.gas.value ?? MIN_GAS_LIMIT,
                ...(tradeRef.current?.gasConfig ?? {}),
            },
            slippageTolerance: currentSlippageSettings.value / 100,
        })

        if (slippageTolerance) currentSlippageSettings.value = slippageTolerance

        PluginTraderMessages.swapSettingsUpdated.sendToAll({
            open: false,
            gasConfig: {
                gasPrice: (transaction as Transaction)?.gasPrice as string | undefined,
                maxFeePerGas: (transaction as Transaction)?.maxFeePerGas as string | undefined,
                maxPriorityFeePerGas: (transaction as Transaction)?.maxPriorityFeePerGas as string | undefined,
            },
        })
    }, [chainId, currentSlippageSettings.value])

    return (
        <InjectedDialog
            open={open}
            onClose={() => {
                setTraderProps(undefined)
                setOpen(false)
            }}
            title={t('plugin_trader_swap')}
            titleBarIconStyle={isDashboard ? 'close' : 'back'}
            titleTail={
                <div className={classes.tail}>
                    <IconButton onClick={() => tradeRef.current?.refresh()}>
                        <Icons.Refresh size={24} className={classes.icon} />
                    </IconButton>
                    {pluginID === NetworkPluginID.PLUGIN_EVM ? (
                        <IconButton onClick={openGasSettingDialog}>
                            <Icons.Gear size={24} className={classes.icon} />
                        </IconButton>
                    ) : null}
                </div>
            }
            className={classes.dialog}>
            <DialogContent className={classes.content}>
                <div className={classes.abstractTabWrapper}>
                    <NetworkTab
                        classes={{
                            indicator: classes.indicator,
                        }}
                        chains={chainIdList}
                    />
                </div>
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId }}>
                    <AllProviderTradeContext.Provider>
                        <Trader
                            {...traderProps}
                            chainId={chainId}
                            classes={{ root: classes.tradeRoot }}
                            ref={tradeRef}
                        />
                    </AllProviderTradeContext.Provider>
                </Web3ContextProvider>
            </DialogContent>
        </InjectedDialog>
    )
}
