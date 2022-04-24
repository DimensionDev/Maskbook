import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
// import { Copy } from 'react-feather'
import { WalletAssetsCard } from './WalletAssets'
import type { BindingProof, PersonaInformation } from '@masknet/shared-base'
import { ImageListDialog } from './ImageList'
import { useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { PersonaAction } from './PersonaAction'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { collectionTypes } from '../types'
import WalletSetting from './WalletSetting'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '520px !important',
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
    titleTailButton: {
        marginLeft: 'auto',
        justifyContent: 'center',
    },
    content: {
        width: 480,
        height: 510,
        maxHeight: 510,
        posotion: 'relative',
        paddingBottom: theme.spacing(3),
    },
    bottomFixed: {
        width: '100%',
        display: 'flex',
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    link: {
        cursor: 'pointer',
        lineHeight: '10px',
        marginTop: 2,
        '&:hover': {
            textDecoration: 'none',
        },
    },
    linkIcon: {
        fill: 'none',
        width: 12,
        height: 12,
        marginLeft: theme.spacing(0.5),
    },
    actions: {
        padding: '0px !important',
    },
}))

export interface ImageManagementProps extends withClasses<never | 'root'> {
    addresses?: BindingProof[]
    title: string
    currentPersona?: PersonaInformation
    open: boolean
    onClose: () => void
    currentVisitingProfile?: IdentityResolved
    footprintList?: collectionTypes[][]
    donationList?: collectionTypes[][]
}

export function ImageManagement(props: ImageManagementProps) {
    const t = useI18N()

    const classes = useStylesExtends(useStyles(), props)
    const { addresses, title, currentPersona, open, onClose, currentVisitingProfile, donationList, footprintList } =
        props
    const [settingAddress, setSettingAddress] = useState<string>()
    const [imageListOpen, setImageListOpen] = useState(false)
    const [walletSettingOpen, setWalletSettingOpen] = useState(false)
    const [collectionIndex, setCollectionIndex] = useState(0)
    const collectionList = title === 'Donations' ? donationList : footprintList

    return (
        <InjectedDialog
            classes={{ paper: classes.root, dialogContent: classes.content, dialogActions: classes.actions }}
            title={title}
            fullWidth={false}
            open={open}
            titleTail={
                <Button size="small" onClick={() => setWalletSettingOpen(true)} className={classes.titleTailButton}>
                    Settings
                </Button>
            }
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <div>
                    {addresses?.map((address, index) => (
                        <WalletAssetsCard
                            key={address.identity}
                            onSetting={() => {
                                setSettingAddress(address.identity)
                                setImageListOpen(true)
                                setCollectionIndex(index)
                            }}
                            type={title}
                            collectionList={collectionList?.[index]}
                            address={address.identity}
                        />
                    ))}
                    <ImageListDialog
                        currentPersona={currentPersona}
                        title={title}
                        address={settingAddress}
                        open={imageListOpen}
                        onClose={() => setImageListOpen(false)}
                        collectionList={collectionList?.[collectionIndex]}
                    />
                    <WalletSetting
                        wallets={addresses}
                        open={walletSettingOpen}
                        title={title}
                        onClose={() => setWalletSettingOpen(false)}
                        currentPersona={currentPersona}
                        currentVisitingProfile={currentVisitingProfile}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <PersonaAction currentPersona={currentPersona} currentVisitingProfile={currentVisitingProfile} />
            </DialogActions>
        </InjectedDialog>
    )
}
