import { formatTokenId } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { useControlledDialog } from '../../../utils'
import { useAsyncRetry } from 'react-use'
import { fetchUserPartsInfo, openMysteryBox } from '../Worker/apis'
import type { FindTrumanI18nFunction, MysteryBox, Part, Quest } from '../types'
import { PartType } from '../types'
import {
    Alert,
    AlertTitle,
    Avatar,
    Box,
    Button,
    Chip,
    DialogContent,
    Grid,
    Link,
    Skeleton,
    Tooltip,
    Typography,
} from '@mui/material'
import formatDateTime from 'date-fns/format'
import { InjectedDialog } from '@masknet/shared'
import { useContext, useMemo, useState } from 'react'
import { LoadingButton } from '@mui/lab'
import getUnixTime from 'date-fns/getUnixTime'
import { FindTrumanContext } from '../context'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme, props) => ({
    skeleton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    ribbonWrapper: {
        position: 'relative',
    },
    ribbon: {
        position: 'absolute',
        width: '70px',
        height: '70px',
        overflow: 'hidden',
        top: '-6px',
        left: '-6px',
        '&:before': {
            position: 'absolute',
            content: '""',
            display: 'block',
            border: '3px solid #0359a3',
            top: 0,
            right: 0,
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
        },
        '&:after': {
            position: 'absolute',
            content: '""',
            display: 'block',
            border: '3px solid #0359a3',
            bottom: 0,
            left: 0,
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
        },
    },
    ribbonGray: {
        '&:before': {
            border: '3px solid #595959',
        },
        '&:after': {
            border: '3px solid #595959',
        },
    },
    ribbonContent: {
        position: 'absolute',
        display: 'block',
        width: '100px',
        padding: '2px 0',
        backgroundColor: 'rgb(29,155,240)',
        boxShadow: '0 5px 10px rgba(0,0,0,.1)',
        color: '#fff',
        textAlign: 'center',
        right: '-6px',
        top: '16px',
        transform: 'rotate(-45deg)',
        zIndex: 1,
    },
    ribbonContentGray: {
        backgroundColor: '#8c8c8c',
    },
    cover: {
        width: '100%',
        objectFit: 'contain',
        borderRadius: '8px',
        position: 'relative',
        trans: 'all .3s',
        background: 'rgba(255, 255, 255, .15)',
    },
}))

interface PartsPanelProps {}

export default function PartsPanel(props: PartsPanelProps) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const {
        value: partsInfo,
        loading,
        retry,
    } = useAsyncRetry(async () => {
        return account ? fetchUserPartsInfo(account) : undefined
    }, [account])

    return (
        <Box>
            {loading ? (
                <Grid container spacing={2}>
                    <PartSkeleton />
                    <PartSkeleton />
                    <PartSkeleton />
                </Grid>
            ) : partsInfo ? (
                <Grid alignItems="center" container spacing={2}>
                    {partsInfo.quests.map((quest) => (
                        <Grid key={quest.id} item xs={4}>
                            <QuestItem quest={quest} />
                        </Grid>
                    ))}
                    {partsInfo.boxes.map((box) => (
                        <Grid key={box.id} item xs={4}>
                            <MysteryBoxItem account={account} onOpened={() => retry()} box={box} />
                        </Grid>
                    ))}
                    {partsInfo.parts.map((part) => (
                        <Grid key={part.tokenId} item xs={4}>
                            <PartItem part={part} />
                        </Grid>
                    ))}
                </Grid>
            ) : null}
        </Box>
    )
}

interface PoapLabelProps {
    id?: string | number
    poapImg: string
    size?: 'small' | 'medium'
}

function PoapLabel(props: PoapLabelProps) {
    const { id, poapImg, size } = props

    return id ? (
        <Chip avatar={<Avatar src={poapImg ?? ''} />} label={`#${id}`} size={size ?? 'small'} variant="filled" />
    ) : (
        <img
            src={poapImg}
            style={{
                width: '24px',
                height: '24px',
                borderRadius: '100%',
            }}
        />
    )
}

function PartSkeleton() {
    const { classes } = useStyles()
    return (
        <Grid className={classes.skeleton} item xs={4}>
            <Skeleton animation="wave" width={80} height={24} />
            <Skeleton variant="rectangular" animation="wave" width={168} height={168} />
            <Skeleton animation="wave" width={168} height={30} />
        </Grid>
    )
}

export function getPartName(t: FindTrumanI18nFunction, type: PartType) {
    switch (type) {
        case PartType.Background:
            return t('plugin_find_truman_dialog_ftg_part_background')
        case PartType.Clothes:
            return t('plugin_find_truman_dialog_ftg_part_clothes')
        case PartType.Skin:
            return t('plugin_find_truman_dialog_ftg_part_face')
        case PartType.Head:
            return t('plugin_find_truman_dialog_ftg_part_head')
        case PartType.Mask:
            return t('plugin_find_truman_dialog_ftg_part_mask')
    }
}

function PartItem(props: { part: Part }) {
    const { part } = props
    const { classes } = useStyles()
    const { t, const: consts } = useContext(FindTrumanContext)
    return (
        <div>
            <Tooltip
                PopperProps={{
                    disablePortal: true,
                }}
                arrow
                title={part.name}>
                <Typography lineHeight="24px" noWrap textAlign="center" variant="body1" color="text.primary">
                    {part.name}
                </Typography>
            </Tooltip>
            <div style={{ position: 'relative' }}>
                <img className={classes.cover} src={part.img} />
            </div>

            <Box display="flex" alignItems="center" justifyContent="space-between" height="30px">
                <Chip size="small" label={getPartName(t, part.type)} color="primary" />
                {part.fromBox?.completedQuest?.needPoap && !!part.fromBox.completedQuest.tokenId && (
                    <PoapLabel poapImg={consts?.poapImg ?? ''} id={part.fromBox.completedQuest.tokenId} />
                )}
            </Box>
        </div>
    )
}

function QuestItem(props: { quest: Quest }) {
    const { quest } = props
    const { classes, cx } = useStyles()
    const { t, const: consts } = useContext(FindTrumanContext)

    const { open: isQuestDialogOpen, onOpen: onQuestDialogOpen, onClose: onQuestDialogClose } = useControlledDialog()

    const meetPoap = useMemo(() => {
        return !quest.needPoap || !!quest.poaps.find((e) => !e.used)
    }, [quest])

    return (
        <div>
            <Box sx={{ height: '24px' }} />
            <div className={classes.ribbonWrapper}>
                <img className={classes.cover} src={consts?.boxImg} />
                {quest.needPoap && (
                    <Box position="absolute" top="4px" right="4px">
                        <PoapLabel size="medium" poapImg={consts?.poapImg ?? ''} />
                    </Box>
                )}
                <div className={cx(classes.ribbon, classes.ribbonGray)}>
                    <Typography className={cx(classes.ribbonContent, classes.ribbonContentGray)} variant="body2">
                        {t('plugin_find_truman_dialog_ribbon_lacked')}
                    </Typography>
                </div>
            </div>
            <Button size="small" color="primary" variant="outlined" fullWidth onClick={onQuestDialogOpen}>
                {meetPoap ? t('plugin_find_truman_dialog_get') : t('plugin_find_truman_poap_required_title_simple')}
            </Button>
            <QuestDialog quest={quest} open={isQuestDialogOpen} onClose={onQuestDialogClose} />
        </div>
    )
}

function MysteryBoxItem(props: { account: string; box: MysteryBox; onOpened: () => void }) {
    const { account, box, onOpened } = props
    const { classes, cx } = useStyles()
    const { t, const: consts } = useContext(FindTrumanContext)
    const [loading, setLoading] = useState(box.isOpened && !box.isMinted)

    const handleOpenBox = async () => {
        try {
            setLoading(true)
            await openMysteryBox(account, {
                timestamp: getUnixTime(Date.now()),
                address: account,
                rawdata: {
                    boxId: box.id,
                },
            })
        } finally {
            setLoading(false)
            onOpened()
        }
    }

    return (
        <div>
            <Box sx={{ height: '24px' }} />
            <div className={classes.ribbonWrapper}>
                <img className={classes.cover} src={box.isOpened ? box.img : consts?.boxImg} />
                {!box.isOpened && box.completedQuest?.needPoap && !!box.completedQuest.tokenId && (
                    <Box position="absolute" top="4px" right="4px">
                        <PoapLabel size="medium" id={box.completedQuest.tokenId} poapImg={consts?.poapImg ?? ''} />
                    </Box>
                )}
                <div className={box.isOpened ? cx(classes.ribbon, classes.ribbonGray) : classes.ribbon}>
                    {box.isOpened ? (
                        <Typography className={cx(classes.ribbonContent, classes.ribbonContentGray)} variant="body2">
                            {t('plugin_find_truman_dialog_ribbon_minted')}
                        </Typography>
                    ) : (
                        <Typography className={classes.ribbonContent} variant="body2">
                            {t('plugin_find_truman_dialog_ribbon_openable')}
                        </Typography>
                    )}
                </div>
            </div>
            {box.isOpened ? (
                <Box display="flex" alignItems="center" justifyContent="space-between" height="30px">
                    <Chip size="small" label={getPartName(t, box.partType)} color="primary" />
                    {box.completedQuest?.needPoap && !!box.completedQuest.tokenId && (
                        <Box position="absolute" top="4px" right="4px">
                            <PoapLabel size="medium" id={box.completedQuest.tokenId} poapImg={consts?.poapImg ?? ''} />
                        </Box>
                    )}
                </Box>
            ) : (
                <LoadingButton
                    loading={loading}
                    size="small"
                    color="primary"
                    variant="contained"
                    fullWidth
                    onClick={handleOpenBox}>
                    {t('plugin_find_truman_dialog_open')}
                </LoadingButton>
            )}
        </div>
    )
}

interface QuestDialogProps {
    quest: Quest
    open: boolean
    onClose: () => void
}

function QuestDialog(props: QuestDialogProps) {
    const { quest, open, onClose } = props
    const { classes } = useStyles()
    const { t, const: consts } = useContext(FindTrumanContext)

    const poapIds = useMemo(() => {
        return quest.poaps.map((e) => formatTokenId(e.tokenId.toString(), 2)).join(', ')
    }, [quest])

    const availablePoap = useMemo(() => {
        return quest.poaps.find((e) => !e.used)
    }, [quest])

    return (
        <InjectedDialog title={t('plugin_find_truman_dialog_get_box_title')} open={open} onClose={onClose}>
            <DialogContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 4,
                }}>
                <img
                    className={classes.cover}
                    style={{
                        width: '250px',
                        height: '250px',
                        marginBottom: '8px',
                    }}
                    src={consts?.boxImg}
                />
                <Typography textAlign="center" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formatDateTime(new Date(quest.startFrom), 'yyyy-MM-dd')}
                </Typography>
                <Typography variant="h6" color="text.primary" gutterBottom>
                    {quest.title}
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {quest.desc}
                </Typography>
                {quest.needPoap && (
                    <Alert severity={availablePoap ? 'success' : 'error'} sx={{ marginTop: 2 }}>
                        <AlertTitle>{t('plugin_find_truman_poap_required_title')}</AlertTitle>
                        {quest.poaps.length === 0 ? (
                            <div>
                                <Typography variant="body2" gutterBottom>
                                    {t('plugin_find_truman_poap_required_empty')}
                                </Typography>
                                <Link
                                    rel="noopener noreferrer"
                                    component="a"
                                    target="_blank"
                                    href={consts?.getPoapUrl}
                                    variant="body2"
                                    sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                                    {t('plugin_find_truman_poap_required_get')}
                                </Link>
                            </div>
                        ) : availablePoap ? (
                            t('plugin_find_truman_poap_required_meet', {
                                id: `#${availablePoap.tokenId}`,
                            })
                        ) : quest.poaps.length > 1 ? (
                            t('plugin_find_truman_poap_required_used_pl', {
                                id: poapIds,
                            })
                        ) : (
                            t('plugin_find_truman_poap_required_used', {
                                id: poapIds,
                            })
                        )}
                    </Alert>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
