import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { Typography } from '@mui/material'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { ChainId, useChainId, useAccount, useWallet } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared'
import { MaskMessages } from '../../utils/messages'
import { useControlledDialog } from '../../utils/hooks/useControlledDialog'
import { RedPacketPluginID } from '../../plugins/RedPacket/constants'
import { FileServicePluginID } from '../../plugins/FileService/constants'
import { ITO_PluginID } from '../../plugins/ITO/constants'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { ClaimAllDialog } from '../../plugins/ITO/SNSAdaptor/ClaimAllDialog'
import { EntrySecondLevelDialog } from './EntrySecondLevelDialog'
import { NetworkTab } from './NetworkTab'
import { TraderDialog } from '../../plugins/Trader/SNSAdaptor/trader/TraderDialog'
import { NetworkPluginID, usePluginIDContext } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => ({
    abstractTabWrapper: {
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 2,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
    },
    tabs: {
        width: 552,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
        // backgroundColor: theme.palette.background.default,
        '& .Mui-selected': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
        },
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    indicator: {
        display: 'none',
    },
    applicationBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: getMaskColor(theme).twitterBackground,
        borderRadius: '8px',
        cursor: 'pointer',
        height: 100,
        '&:hover': {
            transform: 'scale(1.05) translateY(-4px)',
            boxShadow: theme.palette.mode === 'light' ? '0px 10px 16px rgba(0, 0, 0, 0.1)' : 'none',
        },
    },
    applicationWrapper: {
        marginTop: 4,
        display: 'grid',
        gridTemplateColumns: '123px 123px 123px 123px',
        gridTemplateRows: '100px',
        rowGap: 12,
        justifyContent: 'space-between',
        height: 324,
    },
    applicationImg: {
        width: 36,
        height: 36,
        marginBottom: 10,
    },
    disabled: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    title: {
        fontSize: 15,
    },
}))

export interface MaskAppEntry {
    title: string
    img: string
    onClick: any
    supportedChains?: ChainId[]
    hidden: boolean
    walletRequired: boolean
}

interface MaskApplicationBoxProps {
    secondEntries?: MaskAppEntry[]
    secondEntryChainTabs?: ChainId[]
}

export function ApplicationBoard({ secondEntries, secondEntryChainTabs }: MaskApplicationBoxProps) {
    const { classes } = useStyles()
    const currentChainId = useChainId()
    const account = useAccount()
    const selectedWallet = useWallet()
    const currentPluginId = usePluginIDContext()
    const isFlow = currentPluginId === NetworkPluginID.PLUGIN_FLOW

    //#region Encrypted message
    const openEncryptedMessage = useCallback(
        (id?: string) =>
            MaskMessages.events.requestComposition.sendToLocal({
                reason: 'timeline',
                open: true,
                options: {
                    startupPlugin: id,
                },
            }),
        [],
    )
    //#endregion

    //#region Claim All ITO
    const {
        open: isClaimAllDialogOpen,
        onOpen: onClaimAllDialogOpen,
        onClose: onClaimAllDialogClose,
    } = useControlledDialog()
    //#endregion

    //#region Swap
    // const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)
    const { open: isSwapDialogOpen, onOpen: onSwapDialogOpen, onClose: onSwapDialogClose } = useControlledDialog()
    //#endregion

    //#region Fiat on/off ramp
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)
    //#endregion

    //#region second level entry dialog
    const {
        open: isSecondLevelEntryDialogOpen,
        onOpen: onSecondLevelEntryDialogOpen,
        onClose: onSecondLevelEntryDialogClose,
    } = useControlledDialog()

    const [secondLevelEntryDialogTitle, setSecondLevelEntryDialogTitle] = useState('')
    const [secondLevelEntryChains, setSecondLevelEntryChains] = useState<ChainId[] | undefined>([])
    const [secondLevelEntries, setSecondLevelEntries] = useState<MaskAppEntry[]>([])

    const [chainId, setChainId] = useState(
        secondEntryChainTabs?.includes(currentChainId) ? currentChainId : ChainId.Mainnet,
    )

    const openSecondEntryDir = useCallback(
        (title: string, maskAppEntries: MaskAppEntry[], chains: ChainId[] | undefined) => {
            setSecondLevelEntryDialogTitle(title)
            setSecondLevelEntries(maskAppEntries)
            setSecondLevelEntryChains(chains)
            onSecondLevelEntryDialogOpen()
        },
        [],
    )
    //#endregion

    function createEntry(
        title: string,
        img: string,
        onClick: any,
        supportedChains?: ChainId[],
        hidden = false,
        walletRequired = true,
    ) {
        return {
            title,
            img,
            onClick,
            supportedChains,
            hidden,
            walletRequired,
        }
    }

    const firstLevelEntries: MaskAppEntry[] = [
        createEntry(
            'Lucky Drop',
            new URL('./assets/lucky_drop.png', import.meta.url).toString(),
            () => openEncryptedMessage(RedPacketPluginID),
            undefined,
            isFlow,
        ),
        createEntry(
            'File service',
            new URL('./assets/files.png', import.meta.url).toString(),
            () => openEncryptedMessage(FileServicePluginID),
            undefined,
            false,
            false,
        ),
        createEntry(
            'ITO',
            new URL('./assets/token.png', import.meta.url).toString(),
            () => openEncryptedMessage(ITO_PluginID),
            undefined,
            isFlow,
        ),
        createEntry(
            'Claim',
            new URL('./assets/gift.png', import.meta.url).toString(),
            onClaimAllDialogOpen,
            undefined,
            isFlow,
        ),
        createEntry(
            'Mask Bridge',
            new URL('./assets/bridge.png', import.meta.url).toString(),
            () => window.open('https://bridge.mask.io/#/', '_blank', 'noopener noreferrer'),
            undefined,
            isFlow,
            false,
        ),
        createEntry(
            'Mask Box',
            new URL('./assets/mask_box.png', import.meta.url).toString(),
            () => window.open('https://box.mask.io/#/', '_blank', 'noopener noreferrer'),
            undefined,
            isFlow,
            false,
        ),
        createEntry(
            'Swap',
            new URL('./assets/swap.png', import.meta.url).toString(),
            onSwapDialogOpen,
            undefined,
            isFlow,
        ),
        createEntry(
            'Fiat on-ramp',
            new URL('./assets/fiat_ramp.png', import.meta.url).toString(),
            () => setBuyDialog({ open: true, address: account }),
            undefined,
            false,
            false,
        ),
        createEntry(
            'NFTs',
            new URL('./assets/nft.png', import.meta.url).toString(),
            () =>
                openSecondEntryDir(
                    'NFTs',
                    [
                        createEntry(
                            'MaskBox',
                            new URL('./assets/mask_box.png', import.meta.url).toString(),
                            () => window.open('https://box.mask.io/#/', '_blank', 'noopener noreferrer'),
                            undefined,
                            false,
                            false,
                        ),
                        createEntry(
                            'Valuables',
                            new URL('./assets/valuables.png', import.meta.url).toString(),
                            () => {},
                            undefined,
                            true,
                        ),
                    ],
                    undefined,
                ),
            undefined,
            isFlow,
        ),
        createEntry(
            'Investment',
            new URL('./assets/investment.png', import.meta.url).toString(),
            () =>
                openSecondEntryDir(
                    'Investment',
                    [
                        createEntry('Zerion', new URL('./assets/zerion.png', import.meta.url).toString(), () => {}, [
                            ChainId.Mainnet,
                        ]),
                        createEntry('dHEDGE', new URL('./assets/dHEDGE.png', import.meta.url).toString(), () => {}),
                    ],
                    [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.Arbitrum, ChainId.xDai],
                ),
            undefined,
            true,
        ),
        createEntry('Saving', new URL('./assets/saving.png', import.meta.url).toString(), undefined, undefined, true),
        createEntry(
            'Alternative',
            new URL('./assets/more.png', import.meta.url).toString(),
            () =>
                openSecondEntryDir(
                    'Alternative',
                    [
                        createEntry(
                            'PoolTogether',
                            new URL('./assets/pool_together.png', import.meta.url).toString(),
                            () => {},
                        ),
                    ],
                    [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.Arbitrum, ChainId.xDai],
                ),
            undefined,
            true,
        ),
    ]

    return (
        <>
            {secondEntryChainTabs?.length ? (
                <div className={classes.abstractTabWrapper}>
                    <NetworkTab
                        chainId={chainId}
                        setChainId={setChainId}
                        classes={classes}
                        chains={secondEntryChainTabs}
                    />
                </div>
            ) : null}
            <section className={classes.applicationWrapper}>
                {(secondEntries ?? firstLevelEntries).map(
                    ({ title, img, onClick, supportedChains, hidden, walletRequired }, i) =>
                        (!supportedChains || supportedChains?.includes(chainId)) && !hidden ? (
                            <div
                                className={classNames(
                                    classes.applicationBox,
                                    walletRequired && !selectedWallet ? classes.disabled : '',
                                )}
                                onClick={onClick}
                                key={i.toString()}>
                                <img src={img} className={classes.applicationImg} />
                                <Typography className={classes.title} color="textPrimary">
                                    {title}
                                </Typography>
                            </div>
                        ) : null,
                )}
            </section>
            {isClaimAllDialogOpen ? (
                <ClaimAllDialog open={isClaimAllDialogOpen} onClose={onClaimAllDialogClose} />
            ) : null}
            {isSwapDialogOpen ? <TraderDialog open={isSwapDialogOpen} onClose={onSwapDialogClose} /> : null}
            {isSecondLevelEntryDialogOpen ? (
                <EntrySecondLevelDialog
                    title={secondLevelEntryDialogTitle}
                    open={isSecondLevelEntryDialogOpen}
                    entries={secondLevelEntries}
                    chains={secondLevelEntryChains}
                    closeDialog={onSecondLevelEntryDialogClose}
                />
            ) : null}
        </>
    )
}
