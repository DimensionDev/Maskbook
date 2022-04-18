import { Button, DialogActions, DialogContent } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
import { useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { PersonaAction } from './PersonaAction'
import { useAllPersona, useCurrentPersona, useCurrentVisitingProfile } from '../hooks/usePersona'
import { Main } from './Main'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useAddressNames } from '@masknet/web3-shared-evm'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { ImageManagement } from './ImageManagement'
import { useDonations } from '../hooks/useDonations'
import { useFootprints } from '../hooks/useFootprints'
import WalletSetting from './WalletSetting'
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
    const [steps, setSteps] = useState(BodyViewSteps.main)
    const [walletSwitchOpen, setWalletSwitchOpen] = useState(false)
    const persona = useCurrentPersona()
    const currentVisitingProfile = useCurrentVisitingProfile()
    const { value: addressNames = EMPTY_LIST, loading: loadingAddressNames } = useAddressNames(currentVisitingProfile!)
    const allPersona = useAllPersona()
    const currentPersona = allPersona?.find((x) => x.identifier.compressedPoint === persona?.compressedPoint)
    console.log({ currentPersona, currentVisitingProfile, addressNames })

    const {
        value: bindings,
        loading,
        retry: retryQueryBinding,
    } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey!)
    }, [currentPersona])
    console.log({ bindings })

    const handleBack = () => {
        switch (steps) {
            case BodyViewSteps.main:
                onClose()
                break
            case BodyViewSteps.image_display:
                setSteps(BodyViewSteps.main)
                setTitle('Web3 Profile')
                break
            default:
                onClose()
        }
    }

    const TitleButton = () => {
        let button
        switch (steps) {
            case BodyViewSteps.main:
                button = <></>
                break
            case BodyViewSteps.image_display:
                button = (
                    <Button style={{ marginLeft: 'auto' }} onClick={() => setWalletSwitchOpen(true)}>
                        Settings
                    </Button>
                )
                break
        }
        return button
    }

    const wallets = bindings?.proofs?.filter((proof) => proof?.platform === NextIDPlatform.Ethereum) || []
    const { value: donations = EMPTY_LIST, loading: loadingDonations } = useDonations(
        '0xe93735Deb30AAa0810DfdA7fb2B0E2115982B1d1',
    )
    const { value: footprints = EMPTY_LIST, loading: loadingFootprints } = useFootprints(
        '0xe93735Deb30AAa0810DfdA7fb2B0E2115982B1d1',
    )
    console.log({ donations, footprints })

    return (
        <>
            <InjectedDialog
                classes={{ paper: classes.root, dialogContent: classes.content, dialogActions: classes.actions }}
                title={title}
                fullWidth={false}
                open={open}
                titleTail={TitleButton()}
                onClose={handleBack}>
                <DialogContent className={classes.content}>
                    {steps === BodyViewSteps.main && (
                        <Main
                            openImageSetting={(str: string) => {
                                setTitle(str)
                                setSteps(BodyViewSteps.image_display)
                            }}
                            persona={currentPersona}
                            currentVisitingProfile={currentVisitingProfile}
                        />
                    )}
                    {steps === BodyViewSteps.image_display && (
                        <ImageManagement currentPersona={currentPersona} addresses={wallets} title={title} />
                    )}
                </DialogContent>
                <DialogActions>
                    <PersonaAction currentPersona={currentPersona} currentVisitingProfile={currentVisitingProfile} />
                </DialogActions>
            </InjectedDialog>
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
