import { DialogActions, DialogContent } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
import { useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { PersonaAction } from './PersonaAction'
import { useAllPersona, useCurrentPersona, useCurrentVisitingProfile } from '../hooks/usePersona'
import { Main } from './Main'
import { NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { ImageManagement } from './ImageManagement'
import { getDonationList, getFootprintList } from '../hooks/useCollectionList'
import { getWalletList } from '../utils'
import { getWalletHiddenList } from '../hooks/useHiddenList'
const useStyles = makeStyles()((theme) => ({
    root: {
        width: 520,
    },
    paperRoot: {
        backgroundImage: 'none',
        '&>h2': {
            border: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(1.875, 2.5, 1.875, 2.5),
            marginBottom: 24,
        },
    },
    title: {
        height: '32px',
    },
    content: {
        width: 480,
        height: 420,
        maxHeight: 420,
        position: 'relative',
        paddingBottom: theme.spacing(3),
        backgroundColor: theme.palette.background.paper,
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
    bottomFixed: {
        width: '100%',
        display: 'flex',
        padding: '19px 16px',
    },
    actions: {
        padding: '0px !important',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    buttonWrapper: {
        padding: '16px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        flexGrow: 1,
    },
    button: {
        width: '48%',
    },
}))

export interface BuyTokenDialogProps extends withClasses<never | 'root'> {
    open: boolean
    onClose(): void
}

export function Web3ProfileDialog(props: BuyTokenDialogProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { open, onClose } = props
    const [title, setTitle] = useState('Web3 Profile')
    const [imageManageOpen, setImageManageOpen] = useState(false)
    const [accountId, setAccountId] = useState<string>()

    const persona = useCurrentPersona()
    const currentVisitingProfile = useCurrentVisitingProfile()
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

    const wallets =
        bindings?.proofs
            ?.filter((proof) => proof?.platform === NextIDPlatform.Ethereum)
            ?.map((address) => ({
                address: address?.identity,
                platform: address?.platform,
            })) || []

    const accounts = bindings?.proofs?.filter((proof) => proof?.platform === NextIDPlatform.Twitter) || []

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

    const accountList = getWalletList(accounts, wallets, allPersona, hiddenObj, footprintList, donationList)

    console.log({ accounts, allPersona, currentVisitingProfile, accountList, hiddenObj })
    return (
        <>
            <InjectedDialog
                classes={{ paper: classes.root, dialogTitle: classes.title }}
                title={title}
                fullWidth={false}
                open={open}
                onClose={onClose}>
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
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <PersonaAction currentPersona={currentPersona} currentVisitingProfile={currentVisitingProfile} />
                </DialogActions>
            </InjectedDialog>
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
                getBindingsRetry={retryQueryBinding}
            />
        </>
    )
}
