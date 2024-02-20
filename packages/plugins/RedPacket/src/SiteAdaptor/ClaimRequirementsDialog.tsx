import { Alert, SelectNonFungibleContractModal } from '@masknet/shared'
import {
    Box,
    Button,
    Checkbox,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
} from '@mui/material'
import { useRedPacketTrans } from '../locales/index.js'
import { makeStyles } from '@masknet/theme'
import { useCallback, useMemo, useState } from 'react'
import { Icons, type GeneratedIcon } from '@masknet/icons'
import { RequirementType, type FireflyRedpacketSettings } from '../types.js'
import { EMPTY_LIST, NetworkPluginID, PluginID } from '@masknet/shared-base'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { SchemaType, type ChainId } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Trans } from 'react-i18next'
import { getEnumAsArray } from '@masknet/kit'

const useStyles = makeStyles<{ isFirefly: boolean }>()((theme, { isFirefly }) => ({
    container: {
        padding: theme.spacing(2),
        minHeight: 460,
    },
    list: {
        padding: theme.spacing(1.5, 0),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1),
    },
    icon: {
        color: isFirefly ? 'var(--color-light-main)' : theme.palette.maskColor.main,
        minWidth: 20,
        width: 20,
        height: 20,
        marginRight: theme.spacing(1),
    },
    title: {
        color: isFirefly ? 'var(--color-light-main)' : theme.palette.maskColor.main,
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '22px',
        margin: 0,
    },
    checkbox: {
        '& > .MuiBox-root': {
            width: 20,
            height: 20,
        },
    },
    clear: {
        color: '#8E96FF',
        ':hover': {
            background: 'transparent',
        },
    },
    select: {
        background: theme.palette.maskColor.input,
        padding: theme.spacing(1.5),
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
        margin: theme.spacing(0, 1.5),
    },
    selectText: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        fontWeight: 300,
        lineHeight: '22px',
    },
    collection: {
        display: 'flex',
        alignItems: 'center',
        columnGap: theme.spacing(1),
    },
    collectionIcon: {
        width: 24,
        height: 24,
        borderRadius: 500,
    },
    collectionName: {
        fontSize: 15,
        color: isFirefly ? 'var(--color-light-main)' : theme.palette.maskColor.main,
        lineHeight: '20px',
        fontWeight: 700,
    },
    footer: {
        bottom: 0,
        position: 'sticky',
        padding: theme.spacing(2),
        boxSizing: 'border-box',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: theme.palette.maskColor.bottomBg,
    },
}))

interface ClaimRequirementsDialogProps {
    onNext: (settings: FireflyRedpacketSettings) => void
    isFirefly: boolean
    origin?: RequirementType[]
}

export const REQUIREMENT_ICON_MAP: Record<RequirementType, GeneratedIcon> = {
    [RequirementType.Follow]: Icons.AddUser,
    [RequirementType.Like]: Icons.Like,
    [RequirementType.Repost]: Icons.Repost,
    [RequirementType.Comment]: Icons.Comment,
    [RequirementType.NFTHolder]: Icons.NFTHolder,
}

export const REQUIREMENT_TITLE_MAP: Record<RequirementType, React.ReactNode> = {
    [RequirementType.Follow]: <Trans ns={PluginID.RedPacket} i18nKey="follow_me" />,
    [RequirementType.Like]: <Trans ns={PluginID.RedPacket} i18nKey="like" />,
    [RequirementType.Repost]: <Trans ns={PluginID.RedPacket} i18nKey="repost" />,
    [RequirementType.Comment]: <Trans ns={PluginID.RedPacket} i18nKey="comment" />,
    [RequirementType.NFTHolder]: <Trans ns={PluginID.RedPacket} i18nKey="nft_holder" />,
}

export function ClaimRequirementsDialog(props: ClaimRequirementsDialogProps) {
    const t = useRedPacketTrans()
    const [selectedRules, setSelectedRules] = useState(props.origin ?? [RequirementType.Follow])
    const [selectedCollection, setSelectedCollection] = useState<NonFungibleCollection<ChainId, SchemaType>>()
    const { classes } = useStyles({ isFirefly: props.isFirefly })
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const hasNFTHolder = useMemo(() => selectedRules.includes(RequirementType.NFTHolder), [selectedRules])

    const handleClick = useCallback(() => {
        SelectNonFungibleContractModal.open({
            pluginID: NetworkPluginID.PLUGIN_EVM,
            schemaType: SchemaType.ERC721,
            chainId,
            onSubmit: (value: NonFungibleCollection<ChainId, SchemaType>) => setSelectedCollection(value),
        })
    }, [chainId])

    const disabled = useMemo(() => {
        return selectedRules.includes(RequirementType.NFTHolder) && !selectedCollection
    }, [selectedRules, selectedCollection])

    return (
        <>
            <Box className={classes.container}>
                <Alert open>{t.claim_requirements_tips()}</Alert>
                <List dense className={classes.list}>
                    {getEnumAsArray(RequirementType).map(({ value }) => {
                        const checked = selectedRules.includes(value)
                        const Icon = REQUIREMENT_ICON_MAP[value]
                        const title = REQUIREMENT_TITLE_MAP[value]
                        return (
                            <ListItem key={value}>
                                <ListItemIcon className={classes.icon}>
                                    <Icon size={20} />
                                </ListItemIcon>
                                <ListItemText classes={{ primary: classes.title }} primary={title} />
                                <ListItemSecondaryAction>
                                    <Checkbox
                                        classes={{ root: classes.checkbox }}
                                        checked={checked}
                                        onChange={(_, checked) => {
                                            if (checked === false && value === RequirementType.NFTHolder)
                                                setSelectedCollection(undefined)
                                            setSelectedRules(
                                                checked ?
                                                    [...selectedRules, value]
                                                :   selectedRules.filter((x) => x !== value),
                                            )
                                        }}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        )
                    })}
                </List>
                {hasNFTHolder ?
                    <Box className={classes.select} onClick={handleClick}>
                        {selectedCollection ?
                            <Box className={classes.collection}>
                                {selectedCollection?.iconURL ?
                                    <img className={classes.collectionIcon} src={selectedCollection.iconURL} />
                                :   null}
                                {selectedCollection?.name ?
                                    <Typography className={classes.collectionName}>
                                        {selectedCollection.name}
                                    </Typography>
                                :   null}
                            </Box>
                        :   <Typography className={classes.selectText}>
                                {t.select_nft_collection_to_gate_access()}
                            </Typography>
                        }
                        <Icons.ArrowDrop size={18} />
                    </Box>
                :   null}
                <Button
                    variant="text"
                    className={classes.clear}
                    onClick={() => setSelectedRules(EMPTY_LIST)}
                    disableRipple
                    disableElevation>
                    {t.clear_all_requirements()}
                </Button>
            </Box>
            <Box className={classes.footer}>
                <Button
                    disabled={disabled}
                    fullWidth
                    onClick={() =>
                        props.onNext({
                            requirements: selectedRules,
                            nftHolderContract: selectedCollection?.address,
                            nftCollectionName: selectedCollection?.name,
                        })
                    }>
                    {t.next_button()}
                </Button>
            </Box>
        </>
    )
}
