import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { Image, NFTSpamBadge, useReportSpam } from '@masknet/shared'
import { LoadingBase, MaskTextField, ShadowRootTooltip, TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { Box, Button, Checkbox, Stack, Typography } from '@mui/material'
import { memo, useMemo, useState, type HTMLProps, type KeyboardEvent } from 'react'
import { useUserAssets } from './AssetsProvider.js'
import { CollectionsContext } from './CollectionsProvider.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

const useStyles = makeStyles()((theme) => {
    return {
        collectionHeader: {
            display: 'flex',
            flexDirection: 'column',
            color: theme.palette.maskColor.main,
            gap: theme.spacing(1),
            minWidth: 0,
        },
        collectionName: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            minWidth: 0,
            overflow: 'hidden',
        },
        infoRow: {
            display: 'flex',
        },
        info: {
            display: 'flex',
            alignItems: 'center',
            marginRight: 'auto',
            minWidth: 0,
        },
        icon: {
            width: 24,
            height: 24,
            borderRadius: '100%',
            objectFit: 'cover',
        },
        backButton: {
            padding: theme.spacing(1, 0),
            width: 40,
            minWidth: 40,
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            color: theme.palette.maskColor.main,
            backgroundColor: theme.palette.maskColor.thirdMain,
            marginLeft: theme.spacing(1),
        },
        searchButton: {
            borderRadius: 8,
            color: theme.palette.maskColor.bottom,
        },
        checkbox: {
            padding: 0,
        },
        text: {
            fontSize: 16,
            color: theme.palette.maskColor.main,
            lineHeight: '20px',
        },
    }
})

export interface CollectionHeaderProps extends Omit<HTMLProps<HTMLDivElement>, 'onSelect'> {
    assets: Web3Helper.NonFungibleAssetScope[]
    onResetCollection?: (id: undefined) => void
    onSelect?: (assets: Web3Helper.NonFungibleAssetAll[]) => void
}

export const CollectionHeader = memo(function CollectionHeader({
    className,
    assets,
    onResetCollection,
    onSelect,
    ...rest
}: CollectionHeaderProps) {
    const { classes, cx } = useStyles()
    const {
        getVerifiedBy,
        selectMode,
        multiple,
        selectedAssets,
        maxSelection,
        maxSelectionDescription,
        searchKeyword,
        setSearchKeyword,
        disableReport,
    } = useUserAssets()
    const { currentCollectionId, currentCollection } = CollectionsContext.useContainer()
    const { isReporting, isSpam, promptReport } = useReportSpam({
        address: currentCollection?.address,
        chainId: currentCollection?.chainId,
        collectionId: currentCollection?.id,
    })
    const [pendingKeyword, setPendingKeyword] = useState('')

    const { isSelectedAll, isSelectedSome } = useMemo(() => {
        if (!currentCollection) return { isSelectedAll: false, isSelectedSome: false }
        const selectedSet = new Set(
            selectedAssets?.map((x) => `${x.chainId}.${x.address}.${x.tokenId}`.toLowerCase()) ?? [],
        )
        const listingSet = new Set(assets.map((x) => `${x.chainId}.${x.address}.${x.tokenId}`.toLowerCase()))
        const isSelectedAll = selectedSet.size === listingSet.size && selectedSet.difference(listingSet).size === 0
        const isSelectedSome = selectedSet.size > 0 && listingSet.difference(selectedSet).size > 0
        return {
            isSelectedAll,
            isSelectedSome,
        }
    }, [assets, selectedAssets, currentCollection])

    if (!currentCollection) return null
    const currentVerifiedBy = currentCollectionId ? getVerifiedBy(currentCollectionId) : []

    return (
        <div className={cx(classes.collectionHeader, className)} {...rest}>
            <div className={classes.infoRow}>
                <Box className={classes.info}>
                    {currentCollection.iconURL ?
                        <Image className={classes.icon} size={24} src={currentCollection.iconURL} />
                    :   null}
                    <TextOverflowTooltip title={currentCollection.name} as={ShadowRootTooltip} placement="top">
                        <Typography className={classes.collectionName} mx={1}>
                            {currentCollection.name}
                        </Typography>
                    </TextOverflowTooltip>
                    {currentVerifiedBy.length ?
                        <ShadowRootTooltip title={<Trans>Verified by {currentVerifiedBy.join(', ')}</Trans>}>
                            <Icons.Verification size={16} />
                        </ShadowRootTooltip>
                    :   null}
                    {isSpam ?
                        <NFTSpamBadge />
                    :   null}
                </Box>
                <Button variant="text" className={classes.backButton} onClick={() => onResetCollection?.(undefined)}>
                    <Icons.Undo size={16} />
                </Button>
                {!isSpam && !disableReport ?
                    <Button variant="text" className={classes.backButton} onClick={promptReport}>
                        {isReporting ?
                            <LoadingBase size={16} />
                        :   <Icons.Flag size={16} />}
                    </Button>
                :   null}
            </div>
            {selectMode && multiple ?
                <>
                    <Stack direction="row" gap={1}>
                        <MaskTextField
                            wrapperProps={{ flexGrow: 1 }}
                            placeholder={t`Token ID separated by comma, e.g. 1223,1224,`}
                            autoFocus
                            fullWidth
                            value={pendingKeyword}
                            onChange={(event) => setPendingKeyword(event.target.value)}
                            InputProps={{
                                startAdornment: <Icons.Search size={16} />,
                                onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                                    if (event.key !== 'Enter') return
                                    setSearchKeyword(pendingKeyword)
                                },
                            }}
                        />
                        <Button
                            className={classes.searchButton}
                            disabled={!pendingKeyword && !searchKeyword}
                            onClick={() => {
                                if (searchKeyword) {
                                    setSearchKeyword('')
                                    setPendingKeyword('')
                                } else {
                                    setSearchKeyword(pendingKeyword)
                                }
                            }}
                            variant="contained">
                            {searchKeyword ?
                                <Trans>Cancel</Trans>
                            :   <Trans>Search</Trans>}
                        </Button>
                    </Stack>
                    <Stack direction="row">
                        <Stack direction="row" gap="4px" alignItems="center">
                            <Typography
                                className={classes.text}
                                component="label"
                                gap="4px"
                                display="flex"
                                alignItems="center">
                                <Checkbox
                                    checked={isSelectedAll}
                                    indeterminate={isSelectedSome}
                                    classes={{ root: classes.checkbox }}
                                    onChange={() => {
                                        if (isSelectedAll) {
                                            onSelect?.(EMPTY_LIST)
                                        } else {
                                            onSelect?.(assets)
                                        }
                                    }}
                                />
                                <Trans>Select All</Trans>
                            </Typography>
                            <Typography className={classes.text} component="span">
                                ({assets.length})
                            </Typography>
                        </Stack>
                        <Stack direction="row" gap="4px" alignItems="center" ml="auto">
                            <Typography className={classes.text} component="span">
                                ({selectedAssets?.length || 0}/{maxSelection})
                            </Typography>
                            <ShadowRootTooltip title={maxSelectionDescription}>
                                <Icons.Questions size={24} />
                            </ShadowRootTooltip>
                        </Stack>
                    </Stack>
                </>
            :   null}
        </div>
    )
})
