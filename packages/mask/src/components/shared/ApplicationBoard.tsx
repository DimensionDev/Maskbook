import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { Typography } from '@mui/material'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { ChainId, useChainId, useAccount, useWallet } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared'
import { MaskMessages } from '../../utils/messages'
import { useControlledDialog } from '../../utils/hooks/useControlledDialog'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { ClaimAllDialog } from '../../plugins/ITO/SNSAdaptor/ClaimAllDialog'
import { EntrySecondLevelDialog } from './EntrySecondLevelDialog'
import { NetworkTab } from './NetworkTab'
import { TraderDialog } from '../../plugins/Trader/SNSAdaptor/trader/TraderDialog'
import {
    usePluginIDContext,
    useActivatedPluginsSNSAdaptor,
    Plugin,
    ApplicationEntryConduct,
    I18NStringField,
} from '@masknet/plugin-infra'

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
    title: string | I18NStringField
    img: string
    onClick: any
    supportedChains?: ChainId[]
    hidden: boolean
    walletRequired: boolean
    priority: number
    categoryID?: string
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
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor()

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
        title: string | I18NStringField,
        img: URL,
        onClick: any,
        supportedChains?: ChainId[],
        hidden = false,
        walletRequired = true,
        priority = 0,
        categoryID?: string,
    ) {
        return {
            title,
            img: img.toString(),
            onClick,
            supportedChains,
            hidden,
            walletRequired,
            priority,
            categoryID,
        }
    }

    const _firstEntries = snsAdaptorPlugins
        .reduce((acc: MaskAppEntry[], p) => {
            p.ApplicationEntries?.map((entry) => {
                let handle
                switch (entry.conduct.type) {
                    case ApplicationEntryConduct.EncryptedMessage:
                        handle = () =>
                            openEncryptedMessage(
                                (entry.conduct as Plugin.SNSAdaptor.ApplicationEntryForEncryptedmsg).id,
                            )
                        break
                    case ApplicationEntryConduct.Link:
                        handle = () =>
                            window.open(
                                (entry.conduct as Plugin.SNSAdaptor.ApplicationEntryForLink).url,
                                '_blank',
                                'noopener noreferrer',
                            )
                        break
                    case ApplicationEntryConduct.Custom:
                        switch (entry.label) {
                            case 'Claim':
                                handle = onClaimAllDialogOpen
                                break
                            case 'Swap':
                                handle = onSwapDialogOpen
                                break
                            case 'Fiat On-Ramp':
                                handle = () => setBuyDialog({ open: true, address: account })
                                break
                            default:
                                handle = () => undefined
                        }

                        break
                    default:
                        handle = () => undefined
                }

                const supportedNetwork = entry.supportedNetworkList?.find((v) => v.network === currentPluginId)

                acc.push(
                    createEntry(
                        entry.label,
                        entry.icon,
                        handle,
                        supportedNetwork?.chainIdList,
                        !Boolean(supportedNetwork) && entry.walletRequired,
                        entry.walletRequired,
                        entry.priority,
                        entry.categoryID,
                    ),
                )
            })

            return acc
        }, [])
        .sort((a, b) => a.priority - b.priority)

    const categoryEntries = snsAdaptorPlugins.reduce((acc: MaskAppEntry[], p) => {
        p.declareApplicationCategories?.map((category) => {
            acc.push(
                createEntry(
                    category.name,
                    category.icon,
                    () =>
                        openSecondEntryDir(
                            category.name,
                            _firstEntries.filter((entry) => entry.categoryID === category.ID),
                            undefined,
                        ),
                    undefined,
                    category.networkPluginId !== currentPluginId,
                    true,
                    9999,
                ),
            )
        })
        return acc
    }, [])

    const firstEntries = _firstEntries.concat(categoryEntries)

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
                {(secondEntries ?? firstEntries).map(
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
