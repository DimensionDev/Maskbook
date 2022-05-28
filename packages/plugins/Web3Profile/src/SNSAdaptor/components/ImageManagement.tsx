import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
// import { Copy } from 'react-feather'
import { WalletAssetsCard } from './WalletAssets'
import type { PersonaInformation } from '@masknet/shared-base'
import { ImageListDialog } from './ImageList'
import { useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { PersonaAction } from './PersonaAction'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { accountType, WalletTypes } from '../types'
import WalletSetting from './WalletSetting'
import AddWalletDialog from './AddWallet'
import { Empty } from './Empty'

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
        borderRadius: '99px',
    },
    content: {
        width: 480,
        height: 420,
        maxHeight: 420,
        position: 'relative',
        paddingBottom: theme.spacing(3),
        backgroundColor: theme.palette.background.paper,
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
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
    },
}))

export interface ImageManagementProps extends withClasses<never | 'root'> {
    title: string
    currentPersona?: PersonaInformation
    open: boolean
    onClose: () => void
    currentVisitingProfile?: IdentityResolved
    accountList?: accountType
    accountId?: string
    allWallets?: WalletTypes[]
    getWalletHiddenRetry: () => void
}
const getAddressesByTitle = (title: string, accountList: accountType) => {
    if (title === 'Donations') return accountList?.walletList?.donations
    if (title === 'Footprints') return accountList?.walletList?.footprints
    return accountList?.walletList?.NFTs
}
export function ImageManagement(props: ImageManagementProps) {
    const t = useI18N()

    const classes = useStylesExtends(useStyles(), props)
    const {
        title,
        currentPersona,
        open,
        onClose,
        accountId,
        allWallets = [],
        currentVisitingProfile,
        accountList,
        getWalletHiddenRetry,
    } = props
    const [settingAddress, setSettingAddress] = useState<string>()
    const [imageListOpen, setImageListOpen] = useState(false)
    const [walletSettingOpen, setWalletSettingOpen] = useState(false)
    const [addWalletOpen, setAddWalletOpen] = useState(false)
    const addresses = getAddressesByTitle(title, accountList!)

    return (
        <InjectedDialog
            classes={{ paper: classes.root, dialogContent: classes.content, dialogActions: classes.actions }}
            title={title}
            fullWidth={false}
            open={open}
            titleTail={
                <Button
                    size="small"
                    onClick={() =>
                        allWallets && allWallets?.length > 0 ? setWalletSettingOpen(true) : setAddWalletOpen(true)
                    }
                    className={classes.titleTailButton}>
                    {allWallets && allWallets?.length > 0 ? 'Settings' : 'Add wallet'}
                </Button>
            }
            onClose={onClose}>
            <DialogContent className={classes.content}>
                {allWallets?.length > 0 ? (
                    addresses?.map((address) => (
                        <WalletAssetsCard
                            key={address.address}
                            onSetting={() => {
                                setSettingAddress(address.address)
                                setImageListOpen(true)
                            }}
                            type={title}
                            collectionList={address?.collections}
                            address={address.address}
                        />
                    ))
                ) : (
                    <Empty />
                )}
                <ImageListDialog
                    currentPersona={currentPersona}
                    title={title}
                    address={settingAddress}
                    open={imageListOpen}
                    accountId={accountId}
                    onClose={() => setImageListOpen(false)}
                    retryData={getWalletHiddenRetry}
                    collectionList={addresses?.find((address) => address?.address === settingAddress)?.collections}
                />
                <WalletSetting
                    wallets={allWallets}
                    accountList={accountList}
                    open={walletSettingOpen}
                    title={title}
                    accountId={accountId}
                    onClose={() => setWalletSettingOpen(false)}
                    currentPersona={currentPersona}
                    retryData={getWalletHiddenRetry}
                />
                <AddWalletDialog
                    open={addWalletOpen}
                    onCancel={() => setAddWalletOpen(false)}
                    currentPersona={currentPersona!}
                    bindings={allWallets}
                />
            </DialogContent>
            <DialogActions>
                <PersonaAction currentPersona={currentPersona} currentVisitingProfile={currentVisitingProfile} />
            </DialogActions>
        </InjectedDialog>
    )
}
