import { Icons } from '@masknet/icons'
import { useChainId } from '@masknet/plugin-infra/web3'
import { InjectedDialog, PersonaAction } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, NextIDPlatform, PopupRoutes } from '@masknet/shared-base'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { DialogActions, DialogContent } from '@mui/material'
import { sortBy } from 'lodash-unified'
import { useEffect, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { CurrentStatusMap, CURRENT_STATUS } from '../../constants.js'
import { context } from '../context.js'
import { useAllPersonas, useCurrentPersona, useLastRecognizedProfile } from '../hooks/usePersona.js'
import {
    getDonationList,
    getFootprintList,
    getNFTList,
    getWalletHiddenList,
    getWalletList,
    mergeList,
} from '../utils.js'
import { ImageManagement } from './ImageManagement.js'
import { Main } from './Main.js'

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
        color: theme.palette.maskColor.main,
    },
}))

export function Web3ProfileDialog() {
    const classes = useStylesExtends(useStyles(), {})
    const [status, setStatus] = useState(CURRENT_STATUS.Main)
    const [imageManageOpen, setImageManageOpen] = useState(false)
    const [accountId, setAccountId] = useState<string>()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.web3ProfileDialogEvent.on(({ open }) => {
            setOpen(open)
        })
    }, [])

    const persona = useCurrentPersona()
    const currentVisitingProfile = useLastRecognizedProfile()
    const allPersona = useAllPersonas()
    const currentPersona = allPersona.find((x) => x.identifier.rawPublicKey === persona?.rawPublicKey)
    const personaPublicKey = currentPersona?.identifier.publicKeyAsHex

    const { value: bindings, retry: retryQueryBinding } = useAsyncRetry(async () => {
        if (!personaPublicKey) return
        return NextIDProof.queryExistedBindingByPersona(personaPublicKey)
    }, [personaPublicKey])
    useEffect(() => context?.ownProofChanged.on(retryQueryBinding), [retryQueryBinding])

    const { value: avatar } = useAsyncRetry(async () => context.getPersonaAvatar(currentPersona?.identifier), [])

    const wallets = useMemo(() => {
        if (!bindings?.proofs.length) return EMPTY_LIST
        return bindings.proofs
            .filter((proof) => proof.platform === NextIDPlatform.Ethereum)
            .map((address) => ({
                address: address?.identity,
                platform: NetworkPluginID.PLUGIN_EVM,
                updateTime: address.last_checked_at ?? address.created_at,
            }))
    }, [bindings?.proofs])

    const accounts = useMemo(
        () => bindings?.proofs?.filter((proof) => proof.platform === NextIDPlatform.Twitter) || EMPTY_LIST,
        [bindings?.proofs],
    )

    const { value: mainnetNFTList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getNFTList(wallets)
    }, [wallets, currentPersona])

    const { value: polygonNFTList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getNFTList(wallets, ChainId.Matic)
    }, [wallets, currentPersona])

    const NFTList = useMemo(
        () => mergeList(mainnetNFTList ?? [], polygonNFTList ?? []),
        [mainnetNFTList, polygonNFTList],
    )

    const { value: donationList } = useAsyncRetry(async () => {
        return getDonationList(wallets)
    }, [wallets])

    const { value: footprintList } = useAsyncRetry(async () => {
        return getFootprintList(wallets)
    }, [wallets])

    const { value: hiddenObj, retry: retryGetWalletHiddenList } = useAsyncRetry(async () => {
        if (!personaPublicKey) return
        return getWalletHiddenList(personaPublicKey)
    }, [personaPublicKey])

    const accountArr = useMemo(
        () =>
            getWalletList(accounts, wallets, allPersona, hiddenObj, footprintList, donationList, NFTList) ?? EMPTY_LIST,
        [accounts, wallets, allPersona, hiddenObj, footprintList, donationList, NFTList],
    )

    const userId = currentVisitingProfile?.identifier?.userId
    const accountList = useMemo(() => {
        return sortBy(accountArr, (x) => (x.identity.toLowerCase() === userId?.toLowerCase() ? -1 : 0))
    }, [userId, accountArr])
    const chainId = useChainId()

    const openPopupsWindow = () => {
        context.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }

    return (
        <InjectedDialog
            classes={{ dialogContent: classes.content }}
            title={CurrentStatusMap[status].title}
            fullWidth={false}
            open={open}
            isOnBack
            titleTail={
                <Icons.WalletUnderTabs size={24} onClick={openPopupsWindow} className={classes.titleTailButton} />
            }
            onClose={() => setOpen(false)}>
            <DialogContent className={classes.content}>
                <Main
                    openImageSetting={(status: CURRENT_STATUS, accountId: string) => {
                        setStatus(status)
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
                    status={status}
                    onClose={() => {
                        setImageManageOpen(false)
                        setStatus(CURRENT_STATUS.Main)
                    }}
                    open={imageManageOpen}
                    accountId={accountId}
                    currentVisitingProfile={currentVisitingProfile}
                    allWallets={wallets}
                    getWalletHiddenRetry={retryGetWalletHiddenList}
                />
            </DialogContent>
            {currentPersona ? (
                <DialogActions className={classes.actions}>
                    <PersonaAction
                        avatar={avatar === null ? undefined : avatar}
                        currentPersona={currentPersona}
                        currentVisitingProfile={currentVisitingProfile}
                    />
                </DialogActions>
            ) : null}
        </InjectedDialog>
    )
}
