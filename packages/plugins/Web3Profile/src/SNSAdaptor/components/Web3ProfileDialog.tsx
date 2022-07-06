import { DialogActions, DialogContent } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
import { useEffect, useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { useAllPersona, useCurrentPersona, useLastRecognizedProfile } from '../hooks/usePersona'
import { Main } from './Main'
import { CrossIsolationMessages, NextIDPlatform, PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { ImageManagement } from './ImageManagement'
import { getDonationList, getFootprintList, getNFTList, getNFTList_Polygon } from '../hooks/useCollectionList'
import { getWalletList, mergeList, placeFirst } from '../utils'
import { getWalletHiddenList } from '../hooks/useHiddenList'
import { WalletUnderTabsIcon } from '@masknet/icons'
import { context } from '../context'
import { PersonaAction } from './PersonaAction'
import { useChainId } from '@masknet/plugin-infra/web3'
const useStyles = makeStyles()((theme) => ({
    content: {
        width: 568,
        height: 494,
        padding: '0px 16px',
        backgroundColor: theme.palette.background.paper,
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    link: {
        color: theme.palette.text.primary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        marginLeft: '4px',
    },
    linkIcon: {
        marginRight: theme.spacing(1),
        color: '#6E767D',
    },
    card: {
        overflow: 'scroll',
    },
    actions: {
        padding: '0px !important',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    titleTailButton: {
        cursor: 'pointer',
        fill: theme.palette.maskColor.main,
        fontSize: '24px',
    },
}))

export function Web3ProfileDialog() {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const [title, setTitle] = useState('Web3 Profile')
    const [imageManageOpen, setImageManageOpen] = useState(false)
    const [accountId, setAccountId] = useState<string>()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        CrossIsolationMessages.events.requestWeb3ProfileDialog.on(({ open }) => {
            setOpen(open)
        })
    }, [])

    const persona = useCurrentPersona()
    const currentVisitingProfile = useLastRecognizedProfile()
    const allPersona = useAllPersona()
    const currentPersona = allPersona?.find(
        (x: PersonaInformation) => x.identifier.rawPublicKey === persona?.rawPublicKey,
    )

    const {
        value: bindings,
        loading,
        retry: retryQueryBinding,
    } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return NextIDProof.queryExistedBindingByPersona(currentPersona.identifier.publicKeyAsHex!)
    }, [currentPersona])
    useEffect(() => {
        return context?.MaskMessages.events.ownProofChanged.on(() => {
            retryQueryBinding()
        })
    }, [retryQueryBinding])

    const wallets =
        bindings?.proofs
            ?.filter((proof) => proof?.platform === NextIDPlatform.Ethereum)
            ?.map((address) => ({
                address: address?.identity,
                platform: address?.platform,
            })) || []

    const accounts = bindings?.proofs?.filter((proof) => proof?.platform === NextIDPlatform.Twitter) || []

    const { value: MainnetNFTList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getNFTList(wallets?.map((wallet) => wallet?.address))
    }, [wallets?.length])

    const { value: PolygonNFTList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getNFTList_Polygon(wallets?.map((wallet) => wallet?.address))
    }, [wallets?.length])

    const NFTList = mergeList(MainnetNFTList, PolygonNFTList)

    const { value: donationList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getDonationList(wallets?.map((wallet) => wallet?.address))
    }, [wallets?.length])

    const { value: footprintList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getFootprintList(wallets?.map((wallet) => wallet?.address))
    }, [wallets?.length])

    const { value: hiddenObj, retry: retryGetWalletHiddenList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getWalletHiddenList(currentPersona.identifier.publicKeyAsHex!)
    }, [currentPersona])

    const accountArr = getWalletList(accounts, wallets, allPersona, hiddenObj, footprintList, donationList, NFTList)

    const accountList = placeFirst(currentVisitingProfile?.identifier?.userId, accountArr)
    const chainId = useChainId()

    const openPopupsWindow = () => {
        context.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }
    console.log({
        accounts,
        allPersona,
        accountList,
        hiddenObj,
        footprintList,
        donationList,
        NFTList,
        MainnetNFTList,
        PolygonNFTList,
        wallets,
        currentVisitingProfile,
    })
    return (
        <InjectedDialog
            classes={{ dialogContent: classes.content }}
            title={title}
            fullWidth={false}
            open={open}
            isOnBack
            titleTail={<WalletUnderTabsIcon onClick={openPopupsWindow} className={classes.titleTailButton} />}
            onClose={() => setOpen(false)}>
            <DialogContent className={classes.content}>
                <Main
                    openImageSetting={(str: string, accountId: string) => {
                        setTitle(str)
                        setImageManageOpen(true)
                        setAccountId(accountId)
                    }}
                    persona={currentPersona}
                    currentVisitingProfile={currentVisitingProfile}
                    accountList={accountList}
                />
                <ImageManagement
                    currentPersona={currentPersona}
                    accountList={accountList?.find((x) => x?.identity === accountId)}
                    title={title}
                    onClose={() => {
                        setImageManageOpen(false)
                        setTitle('Web3 Profile')
                    }}
                    open={imageManageOpen}
                    accountId={accountId}
                    currentVisitingProfile={currentVisitingProfile}
                    allWallets={wallets}
                    getWalletHiddenRetry={retryGetWalletHiddenList}
                />
            </DialogContent>
            <DialogActions className={classes.actions}>
                <PersonaAction currentPersona={currentPersona} currentVisitingProfile={currentVisitingProfile} />
            </DialogActions>
        </InjectedDialog>
    )
}
