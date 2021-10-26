import { Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { getMaskColor } from '@masknet/theme'
import { MaskMessages } from '../../utils/messages'
import { useControlledDialog } from '../../utils/hooks/useControlledDialog'
import { RedPacketPluginID } from '../../plugins/RedPacket/constants'
import { FileServicePluginID } from '../../plugins/FileService/constants'
import { ITO_PluginID } from '../../plugins/ITO/constants'
import { ClaimAllDialog } from '../../plugins/ITO/SNSAdaptor/ClaimAllDialog'
import { EntrySecondLevelDialog } from './EntrySecondLevelDialog'
import { NetworkTab } from './NetworkTab'
import { ChainId, useChainId } from '@masknet/web3-shared-evm'

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
        backgroundColor: theme.palette.background.default,
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
            transform: 'translateX(2.5px) translateY(-2px)',
            boxShadow: theme.palette.mode === 'light' ? '0px 12px 28px rgba(0, 0, 0, 0.1)' : 'none',
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
}))

export interface MaskAppEntry {
    title: string
    img: string
    onClick: any
    supportedChains?: ChainId[]
}

interface MaskApplicationBoxProps {
    secondEntries?: MaskAppEntry[]
    secondEntryChainTabs?: ChainId[]
}

export function MaskApplicationBox({ secondEntries, secondEntryChainTabs }: MaskApplicationBoxProps) {
    const { classes } = useStyles()
    const currentChainId = useChainId()
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

    //#region second level entry dialog
    const {
        open: isSecondLevelEntryDialogOpen,
        onOpen: onSecondLevelEntryDialogOpen,
        onClose: onSecondLevelEntryDialogClose,
    } = useControlledDialog()

    const [secondLevelEntryDialogTitle, setSecondLevelEntryDialogTitle] = useState('')
    const [secondLevelEntryChains, setSecondLevelEntryChains] = useState<ChainId[]>([])
    const [secondLevelEntries, setSecondLevelEntries] = useState<MaskAppEntry[]>([])

    const [chainId, setChainId] = useState(
        secondEntryChainTabs?.includes(currentChainId) ? currentChainId : ChainId.Mainnet,
    )

    const openSecondEntryDir = useCallback((title: string, maskAppEntries: MaskAppEntry[], chains: ChainId[]) => {
        setSecondLevelEntryDialogTitle(title)
        setSecondLevelEntries(maskAppEntries)
        setSecondLevelEntryChains(chains)
        onSecondLevelEntryDialogOpen()
    }, [])
    //#endregion

    function createEntry(title: string, img: string, onClick: any, supportedChains?: ChainId[]) {
        return {
            title,
            img,
            onClick,
            supportedChains,
        }
    }

    const firstLevelEntries: MaskAppEntry[] = [
        createEntry('Lucky Drop', new URL('./assets/lucky_drop.png', import.meta.url).toString(), () => {
            openEncryptedMessage(RedPacketPluginID)
        }),
        createEntry('File service', new URL('./assets/files.png', import.meta.url).toString(), () => {
            openEncryptedMessage(FileServicePluginID)
        }),
        createEntry('ITO', new URL('./assets/token.png', import.meta.url).toString(), () => {
            openEncryptedMessage(ITO_PluginID)
        }),
        createEntry('Claim', new URL('./assets/gift.png', import.meta.url).toString(), onClaimAllDialogOpen),
        createEntry('Mask Bridge', new URL('./assets/bridge.png', import.meta.url).toString(), undefined),
        createEntry('Mask Box', new URL('./assets/mask_box.png', import.meta.url).toString(), undefined),
        createEntry('Swap', new URL('./assets/swap.png', import.meta.url).toString(), undefined),
        createEntry('Fiat on/off ramp', new URL('./assets/fiat_ramp.png', import.meta.url).toString(), undefined),
        createEntry('NFTs', new URL('./assets/nft.png', import.meta.url).toString(), () =>
            openSecondEntryDir(
                'NFTs',
                [
                    {
                        title: 'MaskBox',
                        img: new URL('./assets/mask_box.png', import.meta.url).toString(),
                        onClick: () => {},
                    },
                    {
                        title: 'Valuables',
                        img: new URL('./assets/valuables.png', import.meta.url).toString(),
                        onClick: () => {},
                    },
                ],
                [ChainId.Mainnet, ChainId.BSC],
            ),
        ),
        createEntry('Investment', new URL('./assets/investment.png', import.meta.url).toString(), () =>
            openSecondEntryDir(
                'Investment',
                [
                    {
                        title: 'Zerion',
                        img: new URL('./assets/zerion.png', import.meta.url).toString(),
                        onClick: () => {},
                        supportedChains: [ChainId.Mainnet],
                    },
                    {
                        title: 'dHEDGE',
                        img: new URL('./assets/dHEDGE.png', import.meta.url).toString(),
                        onClick: () => {},
                    },
                ],
                [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.Arbitrum, ChainId.xDai],
            ),
        ),
        createEntry('Saving', new URL('./assets/saving.png', import.meta.url).toString(), undefined),
        createEntry('Alternative', new URL('./assets/more.png', import.meta.url).toString(), () =>
            openSecondEntryDir(
                'Alternative',
                [
                    {
                        title: 'PoolTogether',
                        img: new URL('./assets/pool_together.png', import.meta.url).toString(),
                        onClick: () => {},
                    },
                ],
                [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.Arbitrum, ChainId.xDai],
            ),
        ),
    ]

    return (
        <>
            {secondEntryChainTabs?.length ? (
                <div className={classes.abstractTabWrapper}>
                    <NetworkTab
                        parentWidth={552}
                        chainId={chainId}
                        setChainId={setChainId}
                        classes={classes}
                        chains={secondEntryChainTabs}
                    />
                </div>
            ) : null}
            <section className={classes.applicationWrapper}>
                {(secondEntries ?? firstLevelEntries).map(({ title, img, onClick, supportedChains }, i) =>
                    !supportedChains || supportedChains?.includes(chainId) ? (
                        <div className={classes.applicationBox} onClick={onClick} key={i.toString()}>
                            <img src={img} className={classes.applicationImg} />
                            <Typography color="textPrimary">{title}</Typography>
                        </div>
                    ) : null,
                )}
            </section>
            {isClaimAllDialogOpen ? (
                <ClaimAllDialog open={isClaimAllDialogOpen} onClose={onClaimAllDialogClose} />
            ) : null}
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
