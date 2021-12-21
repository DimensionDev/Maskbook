import { DialogContent, Card, Grid, Alert, Box, Typography, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useEffect, useState } from 'react'
import { useI18N } from '../../../utils'
import { InjectedDialog, InjectedDialogProps } from '../../../components/shared/InjectedDialog'
import { useAccount } from '@masknet/web3-shared-evm'
import { fetchConst, fetchUserParticipatedStoryStatus } from '../Worker/apis'
import type { UserStoryStatus, FindTrumanConst } from '../types'
import { BorderLinearProgress } from './ResultCard'
import { FindTruman_Const } from '../constants'

interface Props extends InjectedDialogProps {
    onClose: () => void
}

const useStyles = makeStyles()((theme) => {
    return {
        actions: {
            alignSelf: 'center',
        },
        button: {
            borderRadius: 26,
            marginTop: 24,
            fontSize: 16,
            lineHeight: 2.5,
            paddingLeft: 35,
            paddingRight: 35,
        },
        card: {
            borderRadius: '6px',
            marginBottom: '16px',
            padding: '16px',
        },
        media: {
            borderRadius: '8px',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            boxShadow: '0 1px 2px -2px #00000029, 0 3px 6px #0000001f, 0 5px 12px 4px #00000017',
        },
    }
})
const FindTrumanDialog: React.FC<Props> = (props) => {
    const { t, i18n } = useI18N()
    const { classes } = useStyles()
    const account = useAccount().toLowerCase()
    const [statuses, setStatuses] = useState<UserStoryStatus[]>([])
    const [consts, setConsts] = useState<FindTrumanConst>()

    useEffect(() => {
        if (!!account) {
            if (!FindTruman_Const.initialized) {
                FindTruman_Const.init((resolve, reject) => {
                    fetchConst(i18n.language)
                        .then((res) => {
                            resolve(res)
                        })
                        .catch((error) => {
                            reject(error)
                        })
                })
            }
            FindTruman_Const.then((res) => {
                setConsts(res)
            })
            fetchUserParticipatedStoryStatus(account).then((res) => {
                setStatuses(res)
            })
        }
    }, [account])

    const renderProgress = (total: number, success: number, color: 'primary' | 'secondary' | 'success') => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <BorderLinearProgress
                        color={color}
                        value={total > 0 ? (success * 100) / total : 0}
                        variant="determinate"
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" color="text.secondary">{`${success}/${total}`}</Typography>
                </Box>
            </Box>
        )
    }

    const renderStatus = (params: UserStoryStatus) => {
        const { name, img, puzzles, polls } = params
        return (
            <Card className={classes.card} variant="outlined">
                <Grid container rowSpacing={0} columnSpacing={2}>
                    <Grid item xs={5}>
                        <img src={img} className={classes.media} />
                    </Grid>
                    <Grid item xs={7}>
                        <Box sx={{ padding: '0 12px' }}>
                            <Typography variant="h6" color="text.primary" gutterBottom>
                                {name}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item sm={6} xs={12}>
                                    <Box sx={{ padding: '0' }}>
                                        <Typography variant="body1" color="text.primary" gutterBottom>
                                            {t('plugin_find_truman_status_puzzle')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {`${t('plugin_find_truman_puzzle_rate')}${
                                                puzzles.total > 0
                                                    ? ((puzzles.solved * 100) / puzzles.total).toFixed(2)
                                                    : '0.00'
                                            }%`}
                                        </Typography>
                                        {renderProgress(puzzles.total, puzzles.solved, 'success')}
                                        {puzzles.waiting === 1 && (
                                            <Typography variant="caption" color="text.secondary" gutterBottom>{`${
                                                puzzles.waiting
                                            } ${t('plugin_find_truman_puzzle_to_be_revealed')}`}</Typography>
                                        )}
                                        {puzzles.waiting > 1 && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                gutterBottom={false}>{`${puzzles.waiting} ${t(
                                                'plugin_find_truman_puzzles_to_be_revealed',
                                            )}`}</Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <Box sx={{ padding: '0' }}>
                                        <Typography variant="body1" color="text.primary" gutterBottom>
                                            {t('plugin_find_truman_status_poll')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {`${t('plugin_find_truman_voting_rate')}${
                                                polls.total > 0 ? ((polls.hit * 100) / polls.total).toFixed(2) : '0.00'
                                            }%`}
                                        </Typography>
                                        {renderProgress(polls.total, polls.hit, 'secondary')}
                                        {polls.waiting === 1 && (
                                            <Typography variant="caption" color="text.secondary" gutterBottom>{`${
                                                polls.waiting
                                            } ${t('plugin_find_truman_poll_to_be_revealed')}`}</Typography>
                                        )}
                                        {polls.waiting > 1 && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                gutterBottom={false}>{`${polls.waiting} ${t(
                                                'plugin_find_truman_polls_to_be_revealed',
                                            )}`}</Typography>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Card>
        )
    }

    return (
        <InjectedDialog
            open={props.open}
            title={t('plugin_find_truman_display_name')}
            onClose={() => {
                props.onClose()
            }}>
            <DialogContent>
                {!account && <Alert severity="info">{t('plugin_find_truman_connect_wallet_tip')}</Alert>}
                {!!account && statuses.length === 0 && (
                    <Alert
                        severity="info"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                component="a"
                                target="_blank"
                                href={consts?.discoveryUrl}>
                                {consts?.discoveryLabel}
                            </Button>
                        }>
                        {t('plugin_find_truman_no_participation_tip')}
                    </Alert>
                )}
                {statuses.map(renderStatus)}
            </DialogContent>
        </InjectedDialog>
    )
}

export default FindTrumanDialog
