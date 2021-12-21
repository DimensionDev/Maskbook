import { CardContent, Grid, Typography, Box } from '@mui/material'
import type { UserStoryStatus } from '../types'
import { BorderLinearProgress } from './ResultCard'
import { useI18N } from '../../../utils'

interface StageCardProps {
    userStoryStatus?: UserStoryStatus
}
export default function StageCard(props: StageCardProps) {
    const { userStoryStatus } = props
    const { t } = useI18N()

    const renderProgress = (total: number, success: number, color: 'primary' | 'secondary' | 'success') => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <BorderLinearProgress
                        color={color}
                        value={total > 0 ? (success * 100) / total : 0}
                        variant="determinate"
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" color="text.secondary">
                        {success}/{total}
                    </Typography>
                </Box>
            </Box>
        )
    }

    return (
        <CardContent>
            {userStoryStatus && (
                <Grid container spacing={1}>
                    <Grid item sm={6} xs={12}>
                        <Box sx={{ padding: '0 24px' }}>
                            <Typography variant="h6" color="text.primary" gutterBottom>
                                {t('plugin_find_truman_status_puzzle')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {t('plugin_find_truman_puzzle_rate')}
                                {userStoryStatus.puzzles.total > 0
                                    ? ((userStoryStatus.puzzles.solved * 100) / userStoryStatus.puzzles.total).toFixed(
                                          2,
                                      )
                                    : '0.00'}
                                %
                            </Typography>
                            {renderProgress(userStoryStatus.puzzles.total, userStoryStatus.puzzles.solved, 'success')}
                            {userStoryStatus.puzzles.waiting === 1 && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {userStoryStatus.puzzles.waiting} {t('plugin_find_truman_puzzle_to_be_revealed')}
                                </Typography>
                            )}
                            {userStoryStatus.puzzles.waiting > 1 && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {userStoryStatus.puzzles.waiting} {t('plugin_find_truman_puzzles_to_be_revealed')}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <Box sx={{ padding: '0 24px' }}>
                            <Typography variant="h6" color="text.primary" gutterBottom>
                                {t('plugin_find_truman_status_poll')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {t('plugin_find_truman_voting_rate')}
                                {userStoryStatus.polls.total > 0
                                    ? ((userStoryStatus.polls.hit * 100) / userStoryStatus.polls.total).toFixed(2)
                                    : '0.00'}
                                %
                            </Typography>
                            {renderProgress(userStoryStatus.polls.total, userStoryStatus.polls.hit, 'secondary')}
                            {userStoryStatus.polls.waiting === 1 && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {userStoryStatus.polls.waiting} {t('plugin_find_truman_poll_to_be_revealed')}
                                </Typography>
                            )}
                            {userStoryStatus.polls.waiting > 1 && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {userStoryStatus.polls.waiting} {t('plugin_find_truman_polls_to_be_revealed')}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            )}
        </CardContent>
    )
}
