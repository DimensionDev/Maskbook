import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { Image, NFTSpamBadge, useReportSpam } from '@masknet/shared'
import { LoadingBase, MaskTextField, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Box, Button, Checkbox, Stack, Typography } from '@mui/material'
import { memo, useState, type HTMLProps, type KeyboardEvent } from 'react'
import { useUserAssets } from './AssetsProvider.js'
import { CollectionsContext } from './CollectionsProvider.js'

const useStyles = makeStyles()((theme) => {
    return {
        collectionHeader: {
            display: 'flex',
            flexDirection: 'column',
            color: theme.palette.maskColor.main,
            gap: theme.spacing(1),
        },
        infoRow: {
            display: 'flex',
        },
        info: {
            display: 'flex',
            alignItems: 'center',
            marginRight: 'auto',
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

interface Props extends HTMLProps<HTMLDivElement> {
    onResetCollection?: (id: undefined) => void
}

export const CollectionHeader = memo(function CollectionHeader({ className, onResetCollection, ...rest }: Props) {
    const { classes, cx } = useStyles()
    const {
        getVerifiedBy,
        selectMode,
        multiple,
        getAssets,
        selectedAssets,
        maxSelection,
        maxSelectionDescription,
        searchKeyword,
        setSearchKeyword,
    } = useUserAssets()
    const { currentCollectionId, currentCollection } = CollectionsContext.useContainer()
    const { isReporting, isSpam, promptReport } = useReportSpam({
        address: currentCollection?.address,
        chainId: currentCollection?.chainId,
        collectionId: currentCollection?.id,
    })
    const [pendingKeyword, setPendingKeyword] = useState('')

    if (!currentCollection) return null
    const total = getAssets(currentCollection).assets.length
    const currentVerifiedBy = currentCollectionId ? getVerifiedBy(currentCollectionId) : []

    return (
        <div className={cx(classes.collectionHeader, className)} {...rest}>
            <div className={classes.infoRow}>
                <Box className={classes.info}>
                    {currentCollection.iconURL ?
                        <Image className={classes.icon} size={24} src={currentCollection.iconURL} />
                    :   null}
                    <Typography mx={1}>{currentCollection.name}</Typography>
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
                {!isSpam ?
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
                            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                                if (event.key !== 'Enter') return
                                setSearchKeyword(event.currentTarget.value)
                            }}
                            onChange={(event) => setPendingKeyword(event.target.value)}
                            InputProps={{
                                startAdornment: <Icons.Search size={16} />,
                            }}
                        />
                        <Button
                            className={classes.searchButton}
                            disabled={!pendingKeyword}
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
                                <Checkbox classes={{ root: classes.checkbox }} />
                                <Trans>Select All</Trans>
                            </Typography>
                            <Typography className={classes.text} component="span">
                                ({total})
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
