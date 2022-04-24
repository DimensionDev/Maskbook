import { DialogActions, DialogContent } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
import { useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { PersonaAction } from './PersonaAction'
import { useAllPersona, useCurrentPersona, useCurrentVisitingProfile } from '../hooks/usePersona'
import { Main } from './Main'
import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { ImageManagement } from './ImageManagement'
import WalletSetting from './WalletSetting'
import { getDonationList, getFootprintList } from '../hooks/useCollectionList'
const useStyles = makeStyles()((theme) => ({
    root: {
        width: 520,
    },
    paperRoot: {
        backgroundImage: 'none',
        '&>h2': {
            height: 30,
            border: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(1.875, 2.5, 1.875, 2.5),
            marginBottom: 24,
        },
    },
    content: {
        width: 480,
        height: 510,
        maxHeight: 510,
        posotion: 'relative',
        paddingBottom: theme.spacing(3),
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
        boxShadow: '0px 0px 16px rgba(101, 119, 134, 0.2)',
        padding: '19px 16px',
    },
    actions: {
        padding: '0px !important',
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

enum BodyViewSteps {
    main = 'Web3 Profile',
    image_display = 'Settings',
}

export function Web3ProfileDialog(props: BuyTokenDialogProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { open, onClose } = props
    const [title, setTitle] = useState('Web3 Profile')
    const [walletSwitchOpen, setWalletSwitchOpen] = useState(false)
    const [imageManageOpen, setImageManageOpen] = useState(false)

    const persona = useCurrentPersona()
    const currentVisitingProfile = useCurrentVisitingProfile()
    const allPersona = useAllPersona()
    const currentPersona = allPersona?.find((x) => x.identifier.compressedPoint === persona?.compressedPoint)

    const {
        value: bindings,
        loading,
        retry: retryQueryBinding,
    } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey!)
    }, [currentPersona])

    const wallets = bindings?.proofs?.filter((proof) => proof?.platform === NextIDPlatform.Ethereum) || []

    const { value: donationList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getDonationList(wallets?.map((wallet) => wallet?.identity))
    }, [wallets?.length])

    const { value: footprintList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getFootprintList(wallets?.map((wallet) => wallet?.identity))
    }, [wallets?.length])

    return (
        <>
            <InjectedDialog
                classes={{ paper: classes.root, dialogContent: classes.content, dialogActions: classes.actions }}
                title={title}
                fullWidth={false}
                open={open}
                onClose={onClose}>
                <DialogContent className={classes.content}>
                    <Main
                        openImageSetting={(str: string) => {
                            setTitle(str)
                            setImageManageOpen(true)
                        }}
                        persona={currentPersona}
                        currentVisitingProfile={currentVisitingProfile}
                        footprintNumList={footprintList?.map((x) => x?.length)}
                        donationNumList={donationList?.map((x) => x?.length)}
                    />
                </DialogContent>
                <DialogActions>
                    <PersonaAction currentPersona={currentPersona} currentVisitingProfile={currentVisitingProfile} />
                </DialogActions>
            </InjectedDialog>
            <ImageManagement
                currentPersona={currentPersona}
                addresses={wallets}
                title={title}
                onClose={() => setImageManageOpen(false)}
                open={imageManageOpen}
                footprintList={footprintList}
                donationList={donationList}
                currentVisitingProfile={currentVisitingProfile}
            />

            <WalletSetting
                wallets={wallets}
                open={walletSwitchOpen}
                title={title}
                onClose={() => setWalletSwitchOpen(false)}
                currentPersona={currentPersona}
                currentVisitingProfile={currentVisitingProfile}
            />
        </>
    )
}
