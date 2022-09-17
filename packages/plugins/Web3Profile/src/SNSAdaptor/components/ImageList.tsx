import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ChainId, SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { useEffect, useState } from 'react'
import { useI18N } from '../../locales/index.js'
import { PLUGIN_ID } from '../../constants.js'
import { InjectedDialog, CollectionTypes, WalletTypes } from '@masknet/shared'
import { PersonaInformation, NextIDPlatform } from '@masknet/shared-base'
import { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { AddNFT } from './AddCollectibles.js'
import classNames from 'classnames'
import { CollectionList } from './CollectionList.js'

const useStyles = makeStyles()((theme) => {
    return {
        walletInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        titleTailButton: {
            marginLeft: 'auto',
            justifyContent: 'center',
        },
        walletName: {
            fontSize: '16px',
            fontWeight: 400,
            marginLeft: '4px',
        },
        collectionWrap: {
            position: 'relative',
            cursor: 'pointer',
            display: 'flex',
            overflow: 'hidden',
            padding: 0,
            flexDirection: 'column',
            borderRadius: 12,
            userSelect: 'none',
            lineHeight: 0,
        },
        content: {
            width: 600,
            height: 492,
            padding: 0,
            maxHeight: 492,
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
            overflow: 'hidden',
        },
        actions: {
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
            height: '72px',
            zIndex: 1,
            padding: '0 !important',
        },
        buttonWrapper: {
            padding: '16px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexGrow: 1,
        },
        cancelButton: {
            width: '48%',
            borderRadius: '8px',
            backgroundColor: theme.palette.maskColor.thirdMain,
            color: theme.palette.maskColor.main,
            '&:hover': {
                backgroundColor: theme.palette.maskColor.thirdMain,
            },
        },
        button: {
            width: '48%',
            borderRadius: '8px',
        },
        list: {
            gridRowGap: 16,
            gridColumnGap: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 64px)',
            gridTemplateRows: 64,
            padding: '0 16px',
        },
        AddCollectiblesButton: {
            fontWeight: 600,
            color: '#1D9BF0',
            display: 'none',
        },
        unListedEmpty: {
            color: theme.palette.maskColor.third,
            alignSelf: 'center',
            fontSize: '14px',
            fontWeight: 400,
            justifySelf: 'center',
        },
        scrollBar: {
            overflowX: 'hidden',
            '::-webkit-scrollbar': {
                backgroundColor: 'transparent',
                width: 20,
            },
            '::-webkit-scrollbar-thumb': {
                borderRadius: '20px',
                width: 5,
                border: '7px solid rgba(0, 0, 0, 0)',
                backgroundColor: theme.palette.maskColor.secondaryLine,
                backgroundClip: 'padding-box',
            },
        },
        listedBox: {
            display: 'flex',
            flexWrap: 'wrap',
            height: 232,
            justifyContent: 'center',
        },
        unlistedBox: {
            display: 'flex',
            flexWrap: 'wrap',
            height: 170,
            justifyContent: 'center',
        },
    }
})

export interface ImageListDialogProps extends withClasses<never | 'root'> {
    address?: WalletTypes
    open: boolean
    onClose: () => void
    title: string
    currentPersona?: PersonaInformation
    collectionList?: CollectionTypes[]
    accountId?: string
    retryData: () => void
}

export function ImageListDialog(props: ImageListDialogProps) {
    const {
        address = { address: ZERO_ADDRESS },
        open,
        onClose,
        retryData,
        title,
        accountId,
        currentPersona,
        collectionList,
    } = props
    const t = useI18N()
    const { Storage } = useWeb3State()
    const classes = useStylesExtends(useStyles(), props)
    const [unListedCollections, setUnListedCollections] = useState<CollectionTypes[]>([])
    const [listedCollections, setListedCollections] = useState<CollectionTypes[]>([])
    const [confirmButtonDisabled, setConfirmButtonDisabled] = useState(true)
    const [open_, setOpen_] = useState(false)

    useEffect(() => {
        setListedCollections(collectionList?.filter((collection) => !collection?.hidden) || [])
        setUnListedCollections(collectionList?.filter((collection) => collection?.hidden) || [])
        setConfirmButtonDisabled(true)
    }, [collectionList, open])

    const unList = (key: string | undefined) => {
        if (!key) return
        if (confirmButtonDisabled) setConfirmButtonDisabled(false)
        const unListingCollection = listedCollections?.find((collection) => collection?.key === key)
        if (unListingCollection) {
            setUnListedCollections((pre) => [...pre, unListingCollection])
        }
        const currentListed = [...listedCollections]
        setListedCollections(currentListed?.filter((collection) => collection?.key !== key))
    }
    const list = (key: string | undefined) => {
        if (!key) return
        if (confirmButtonDisabled) setConfirmButtonDisabled(false)
        const listingCollection = unListedCollections?.find((collection) => collection?.key === key)
        if (listingCollection) {
            setListedCollections((pre) => [...pre, listingCollection])
        }

        const currentUnListed = [...unListedCollections]
        setUnListedCollections(currentUnListed?.filter((collection) => collection?.key !== key))
    }

    const onConfirm = async () => {
        if (!currentPersona?.identifier.publicKeyAsHex) return
        const patch = {
            unListedCollections: {
                [address.address]: {
                    [title]: unListedCollections?.map((x) => x?.key),
                },
            },
        }
        try {
            if (!Storage || !accountId) return
            const storage = Storage.createNextIDStorage(accountId, NextIDPlatform.Twitter, currentPersona.identifier)

            await storage.set(PLUGIN_ID, patch)

            onClose()
            retryData()
        } catch (err) {
            console.log({ err })
        }
    }

    const onAddClick = (token: NonFungibleToken<ChainId, SchemaType>) => {
        // # TODO
        // setTokens((_tokens) => uniqBy([..._tokens, token], (x) => x.contract?.address.toLowerCase() + x.tokenId))
    }

    return (
        <InjectedDialog
            classes={{ paper: classes.root, dialogContent: classes.content }}
            title={title}
            fullWidth={false}
            open={open}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <div>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 2,
                        }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>{t.listed()}</Typography>
                    </Box>
                    <Box className={classNames(classes.listedBox, classes.scrollBar)}>
                        {listedCollections && listedCollections.length > 0 ? (
                            <CollectionList
                                classes={{ list: classes.list, collectionWrap: classes.collectionWrap }}
                                onList={unList}
                                collections={listedCollections}
                            />
                        ) : (
                            <Typography className={classes.unListedEmpty}>
                                {!collectionList || collectionList?.length === 0
                                    ? t.no_items_found()
                                    : t.no_listed_collection({ collection: title })}
                            </Typography>
                        )}
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '16px', fontWeight: 700, padding: 2 }}>{t.unlisted()}</Typography>
                    </Box>
                    <Box className={classNames(classes.unlistedBox, classes.scrollBar)}>
                        {unListedCollections && unListedCollections.length > 0 ? (
                            <CollectionList
                                classes={{ list: classes.list, collectionWrap: classes.collectionWrap }}
                                onList={list}
                                collections={unListedCollections}
                            />
                        ) : (
                            <Typography className={classes.unListedEmpty}>
                                {listedCollections && listedCollections?.length > 0
                                    ? t.no_unlisted_collection({ collection: title })
                                    : (!collectionList || collectionList?.length === 0) && t.no_items_found()}
                            </Typography>
                        )}
                    </Box>
                    <AddNFT
                        account={address.address}
                        chainId={ChainId.Mainnet}
                        title={t.add_collectible()}
                        open={open_}
                        onClose={() => setOpen_(false)}
                        onAddClick={onAddClick}
                        expectedPluginID={address?.platform ?? NetworkPluginID.PLUGIN_EVM}
                    />
                </div>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <div className={classes.buttonWrapper}>
                    <Button className={classes.cancelButton} onClick={onClose}>
                        {t.cancel()}
                    </Button>
                    <Button className={classes.button} onClick={onConfirm} disabled={confirmButtonDisabled}>
                        {t.save()}
                    </Button>
                </div>
            </DialogActions>
        </InjectedDialog>
    )
}
