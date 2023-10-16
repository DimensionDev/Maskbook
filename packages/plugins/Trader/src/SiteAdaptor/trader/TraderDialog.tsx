import { useEffect, useRef, useState, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { PluginID, NetworkPluginID, CrossIsolationMessages, type TokenType, Sniffings } from '@masknet/shared-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import {
    useChainContext,
    useChainIdValid,
    useNetworkContext,
    useWeb3Others,
    useFungibleToken,
} from '@masknet/web3-hooks-base'
import { type ChainId, GasEditor, SchemaType, type Transaction } from '@masknet/web3-shared-evm'
import { DialogContent, dialogTitleClasses, IconButton } from '@mui/material'
import { InjectedDialog, NetworkTab, SelectGasSettingsModal } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { PluginTraderMessages } from '../../messages.js'
import { Trader, type TraderRef } from './Trader.js'
import { currentSlippageSettings } from '../../settings.js'
import { MIN_GAS_LIMIT } from '../../constants/index.js'
import { useTraderTrans } from '../../locales/index.js'

const useStyles = makeStyles<{ rotate: boolean }>()((theme, { rotate }) => ({
    abstractTabWrapper: {
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 2,

        '& > div .MuiBox-root': Sniffings.is_dashboard_page
            ? {
                  background: MaskColorVar.mainBackground,
              }
            : {},
    },
    content: {
        padding: 0,
        minHeight: 564,
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
    iconRotate: {
        '@keyframes rotate': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(-360deg)',
            },
        },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: rotate ? 'rotate 1.5s linear' : 'none',
        transformOrigin: 'center',
    },
}))

export function TraderDialog(props: { share: ((text: string) => void) | undefined }) {
    const tradeRef = useRef<TraderRef>(null)
    const traderDefinition = useActivatedPlugin(PluginID.Trader, 'any')
    const { pluginID } = useNetworkContext()
    const { chainId, setChainId } = useChainContext()
    const Others = useWeb3Others()
    const chainIdList = traderDefinition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []
    const t = useTraderTrans()
    const [rotate, setRotate] = useState(false)
    const { classes } = useStyles({ rotate })
    const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

    const chainIdValid = useChainIdValid(pluginID, chainId)
    const [defaultCoins, setDefaultCoins] = useState<
        | {
              defaultInputCoin?: TokenType
              defaultOutputCoin?: TokenType
          }
        | undefined
    >({
        defaultInputCoin: undefined,
        defaultOutputCoin: undefined,
    })

    const [open, setOpen] = useState(false)

    const defaultInputCoin = defaultCoins?.defaultInputCoin
    const defaultOutputCoin = defaultCoins?.defaultOutputCoin

    const inputFungibleToken = useMemo(
        () =>
            Others.createFungibleToken(
                chainId,
                Others.isNativeTokenAddress(defaultInputCoin?.address) ? SchemaType.Native : SchemaType.ERC20,
                defaultInputCoin?.address ?? '',
                defaultInputCoin?.name ?? '',
                defaultInputCoin?.symbol ?? '',
                defaultInputCoin?.decimals ?? 0,
            ),
        [chainId],
    )

    const outputFungibleToken = useMemo(
        () =>
            Others.createFungibleToken(
                chainId,
                Others.isNativeTokenAddress(defaultOutputCoin?.address) ? SchemaType.Native : SchemaType.ERC20,
                defaultOutputCoin?.address ?? '',
                defaultOutputCoin?.name ?? '',
                defaultOutputCoin?.symbol ?? '',
                defaultOutputCoin?.decimals ?? 0,
            ),
        [chainId],
    )

    // TODO: Other network schema support
    const { data: inputToken } = useFungibleToken(pluginID, defaultInputCoin?.address, inputFungibleToken, { chainId })
    const { data: outputToken } = useFungibleToken(pluginID, defaultOutputCoin?.address, outputFungibleToken, {
        chainId,
    })
    // #region update default input or output token

    useEffect(() => {
        return CrossIsolationMessages.events.swapDialogEvent.on(({ open, traderProps }) => {
            setOpen(open)
            if (traderProps) {
                const { defaultInputCoin, defaultOutputCoin } = traderProps
                setDefaultCoins({
                    defaultInputCoin,
                    defaultOutputCoin,
                })
                if (traderProps.chainId) setChainId(traderProps.chainId as Web3Helper.ChainIdAll)
            }
        })
    }, [])
    // #endregion

    useEffect(() => {
        if (!chainIdValid) setOpen(false)
    }, [chainIdValid])

    const [, openGasSettingDialog] = useAsyncFn(async () => {
        const { settings } = await SelectGasSettingsModal.openAndWaitForClose({
            chainId,
            disableGasLimit: true,
            disableSlippageTolerance: false,
            transaction: {
                gas: tradeRef.current?.focusedTrade?.gas ?? MIN_GAS_LIMIT,
                ...tradeRef.current?.gasConfig,
            },
            slippageTolerance: currentSlippageSettings.value / 100,
        })
        if (settings?.slippageTolerance) currentSlippageSettings.value = settings.slippageTolerance

        PluginTraderMessages.swapSettingsUpdated.sendToAll({
            open: false,
            gasConfig: GasEditor.fromTransaction(
                chainId as ChainId,
                settings?.transaction as Transaction,
            ).getGasConfig(),
        })
    }, [chainId, currentSlippageSettings.value])

    return (
        <InjectedDialog
            open={open}
            onClose={() => {
                setDefaultCoins(undefined)
                setOpen(false)
            }}
            title={t.plugin_trader_swap()}
            titleBarIconStyle={Sniffings.is_dashboard_page ? 'close' : 'back'}
            titleTail={
                <div className={classes.tail}>
                    <IconButton
                        onClick={() => {
                            if (rotate) return
                            if (timer) clearTimeout(timer)
                            setRotate(true)
                            setTimer(
                                setTimeout(() => {
                                    setRotate(false)
                                }, 1500),
                            )
                            tradeRef.current?.refresh()
                        }}>
                        <div className={classes.iconRotate}>
                            <Icons.Refresh size={24} className={classes.icon} />
                        </div>
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
                    <NetworkTab chains={chainIdList} pluginID={NetworkPluginID.PLUGIN_EVM} />
                </div>
                <AllProviderTradeContext.Provider>
                    <Trader
                        share={props.share}
                        defaultInputCoin={defaultInputCoin ? inputToken : undefined}
                        defaultOutputCoin={defaultOutputCoin ? outputToken : undefined}
                        chainId={chainId}
                        classes={{ root: classes.tradeRoot }}
                        ref={tradeRef}
                    />
                </AllProviderTradeContext.Provider>
            </DialogContent>
        </InjectedDialog>
    )
}
