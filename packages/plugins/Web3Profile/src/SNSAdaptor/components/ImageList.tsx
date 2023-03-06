import { useWeb3State } from '@masknet/web3-hooks-base'
import { CollectionTypes, InjectedDialog, WalletTypes } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NextIDPlatform, isSameAddress, NonFungibleToken, PersonaInformation } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'
import { ChainId, SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { isEqual, sortBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PLUGIN_ID } from '../../constants.js'
import { useI18N } from '../../locales/index.js'
import { AddNFT } from './AddCollectibles.js'
import { CollectionList } from './CollectionList.js'

const useStyles = makeStyles<void, 'list'>()((theme, _, refs) => {
    return {
        collectionWrap: {
            position: 'relative',
            cursor: 'pointer',
            display: 'flex',
            padding: 0,
            flexDirection: 'column',
            borderRadius: 12,
            userSelect: 'none',
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
            [`.${refs.list}`]: {
                paddingBottom: 30,
            },
        },
    }
})

export interface ImageListDialogProps extends withClasses<'root'> {
    wallet: WalletTypes
    open: boolean
    onClose: () => void
    title: string
    currentPersona?: PersonaInformation
    collectionList?: CollectionTypes[]
    accountId?: string
    retryData: () => void
    unlistedKeys: string[]
}

export function ImageListDialog(props: ImageListDialogProps) {
    const {
        wallet,
        open,
        onClose,
        retryData,
        title,
        accountId,
        currentPersona,
        collectionList = EMPTY_LIST,
        unlistedKeys,
    } = props
    const t = useI18N()
    const { Storage } = useWeb3State()
    const { classes, cx } = useStyles(undefined, { props })
    const [addNFTOpen, setAddNFTOpen] = useState(false)

    const [pendingUnlistedKeys, setPendingUnlistedKeys] = useState(unlistedKeys)

    useEffect(() => {
        setPendingUnlistedKeys(unlistedKeys)
    }, [unlistedKeys, open])
    const confirmButtonDisabled = isEqual(sortBy(unlistedKeys), sortBy(pendingUnlistedKeys))

    const unListedCollections = useMemo(
        () => collectionList.filter((x) => pendingUnlistedKeys.includes(x.key)),
        [collectionList, pendingUnlistedKeys],
    )
    const listedCollections = useMemo(
        () => collectionList.filter((x) => !pendingUnlistedKeys.includes(x.key)),
        [collectionList, pendingUnlistedKeys],
    )

    const unList = useCallback((key: string) => {
        setPendingUnlistedKeys((keys) => [...keys, key])
    }, [])

    const list = useCallback((key: string) => {
        setPendingUnlistedKeys((keys) => keys.filter((x) => x !== key))
    }, [])

    const onConfirm = async () => {
        if (
            !currentPersona?.identifier.publicKeyAsHex ||
            !wallet?.address ||
            isSameAddress(wallet.address, ZERO_ADDRESS)
        )
            return
        try {
            if (!Storage || !accountId) return
            const patch = {
                unListedCollections: {
                    [wallet.address]: {
                        [title]: pendingUnlistedKeys,
                    },
                },
            }
            const storage = Storage.createNextIDStorage(accountId, NextIDPlatform.Twitter, currentPersona.identifier)
            await storage.set(PLUGIN_ID, patch)

            onClose()
            retryData()
        } catch (err) {
            console.log('Failed to update settings', err)
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
                    <Box className={cx(classes.listedBox, classes.scrollBar)}>
                        {listedCollections?.length > 0 ? (
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
                    <Box className={cx(classes.unlistedBox, classes.scrollBar)}>
                        {unListedCollections.length > 0 ? (
                            <CollectionList
                                classes={{ list: classes.list, collectionWrap: classes.collectionWrap }}
                                onList={list}
                                collections={unListedCollections}
                            />
                        ) : (
                            <Typography className={classes.unListedEmpty}>
                                {listedCollections?.length > 0
                                    ? t.no_unlisted_collection({ collection: title })
                                    : (!collectionList || collectionList?.length === 0) && t.no_items_found()}
                            </Typography>
                        )}
                    </Box>
                    <AddNFT
                        account={wallet.address}
                        chainId={ChainId.Mainnet}
                        title={t.add_collectible()}
                        open={addNFTOpen}
                        onClose={() => setAddNFTOpen(false)}
                        onAddClick={onAddClick}
                        expectedPluginID={wallet.networkPluginID}
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
