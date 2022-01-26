import { useAccount } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { useControlledDialog } from '../../../utils'
import { useAsyncRetry } from 'react-use'
import { fetchUserPartsInfo, openMysteryBox } from '../Worker/apis'
import type { FindTrumanI18nFunction, MysteryBox, Part, Quest } from '../types'
import { PartType } from '../types'
import { Box, Button, Chip, DialogContent, Grid, Skeleton, Tooltip, Typography } from '@mui/material'
import formatDateTime from 'date-fns/format'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useContext, useState } from 'react'
import { LoadingButton } from '@mui/lab'
import getUnixTime from 'date-fns/getUnixTime'
import { FindTrumanContext } from '../context'

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
        width: '120px',
        height: '120px',
        borderRadius: '8px',
        position: 'relative',
        trans: 'all .3s',
        background: 'rgba(255, 255, 255, .15)',
    },
}))

interface PartsPanelProps {}

export default function PartsPanel(props: PartsPanelProps) {
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)
    const account = useAccount()

    const {
        value: partsInfo,
        loading,
        retry,
    } = useAsyncRetry(async () => {
        return account ? fetchUserPartsInfo(account) : undefined
    }, [account])

    return (
        <Box pl={1} pr={2}>
            {loading ? (
                <Grid container spacing={2}>
                    <PartSkeleton />
                    <PartSkeleton />
                    <PartSkeleton />
                    <PartSkeleton />
                </Grid>
            ) : partsInfo ? (
                <Grid alignItems="center" container spacing={2}>
                    {partsInfo.quests.map((quest) => (
                        <Grid key={quest.id} item xs={3}>
                            <QuestItem quest={quest} />
                        </Grid>
                    ))}
                    {partsInfo.boxes.map((box) => (
                        <Grid key={box.id} item xs={3}>
                            <MysteryBoxItem account={account} onOpened={() => retry()} box={box} />
                        </Grid>
                    ))}
                    {partsInfo.parts.map((part) => (
                        <Grid key={part.tokenId} item xs={3}>
                            <PartItem part={part} />
                        </Grid>
                    ))}
                </Grid>
            ) : null}
        </Box>
    )
}

function PartSkeleton() {
    const { classes } = useStyles()
    return (
        <Grid className={classes.skeleton} item xs={3}>
            <Skeleton animation="wave" width={80} height={18} />
            <Skeleton variant="rectangular" animation="wave" width={120} height={120} />
            <Skeleton animation="wave" width={120} height={30} />
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
    const { t } = useContext(FindTrumanContext)
    return (
        <div style={{ position: 'relative' }}>
            <img className={classes.cover} src={part.img} />
            <Box columnGap={1} display="flex" alignItems="center" height="30px">
                <Chip size="small" label={getPartName(t, part.type)} color="primary" />
                <Tooltip
                    PopperProps={{
                        disablePortal: true,
                    }}
                    arrow
                    title={part.name}>
                    <Typography noWrap variant="body2" color="text.primary">
                        {part.name}
                    </Typography>
                </Tooltip>
            </Box>
        </div>
    )
}

function QuestItem(props: { quest: Quest }) {
    const { quest } = props
    const { classes, cx } = useStyles()
    const { t, const: consts } = useContext(FindTrumanContext)

    const { open: isQuestDialogOpen, onOpen: onQuestDialogOpen, onClose: onQuestDialogClose } = useControlledDialog()

    return (
        <div>
            <div className={classes.ribbonWrapper}>
                <img className={classes.cover} src={consts?.boxImg} />
                <div className={cx(classes.ribbon, classes.ribbonGray)}>
                    <Typography className={cx(classes.ribbonContent, classes.ribbonContentGray)} variant="body2">
                        {t('plugin_find_truman_dialog_ribbon_lacked')}
                    </Typography>
                </div>
            </div>
            <Button size="small" color="primary" variant="outlined" fullWidth onClick={onQuestDialogOpen}>
                {t('plugin_find_truman_dialog_get')}
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
            <div className={classes.ribbonWrapper}>
                <img className={classes.cover} src={box.isOpened ? box.img : consts?.boxImg} />
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
                <Box display="flex" alignItems="center" height="30px">
                    <Chip size="small" label={getPartName(t, box.partType)} color="primary" />
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
            </DialogContent>
        </InjectedDialog>
    )
}
