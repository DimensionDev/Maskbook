import { Box, CardContent, Grid, Typography } from '@mui/material'
import type { UserStoryStatus } from '../types'
import { BorderLinearProgress } from './ResultCard'
import { useContext } from 'react'
import { FindTrumanContext } from '../context'

interface StageCardProps {
    userStoryStatus?: UserStoryStatus
}
export default function StageCard(props: StageCardProps) {
    const { userStoryStatus } = props
    const { t } = useContext(FindTrumanContext)

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
                <Box>
                    <Grid container spacing={1}>
                        <Grid item sm={6} xs={12}>
                            <Box sx={{ padding: '0 24px' }}>
                                <Typography variant="h6" color="text.primary" gutterBottom>
                                    {t('plugin_find_truman_dialog_critical')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {t('plugin_find_truman_puzzle_rate')}
                                    {userStoryStatus.critical.total > 0
                                        ? (
                                              (userStoryStatus.critical.correct * 100) /
                                              userStoryStatus.critical.total
                                          ).toFixed(2)
                                        : '0.00'}
                                    %
                                </Typography>
                                {renderProgress(
                                    userStoryStatus.critical.total,
                                    userStoryStatus.critical.correct,
                                    'success',
                                )}
                                {userStoryStatus.critical.waiting === 1 && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {userStoryStatus.critical.waiting}
                                        {t('plugin_find_truman_puzzle_to_be_revealed')}
                                    </Typography>
                                )}
                                {userStoryStatus.critical.waiting > 1 && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {userStoryStatus.critical.waiting}
                                        {t('plugin_find_truman_polls_to_be_revealed')}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <Box sx={{ padding: '0 24px' }}>
                                <Typography variant="h6" color="text.primary" gutterBottom>
                                    {t('plugin_find_truman_dialog_noncritical')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {t('plugin_find_truman_voting_rate')}
                                    {userStoryStatus.nonCritical.total > 0
                                        ? (
                                              (userStoryStatus.nonCritical.correct * 100) /
                                              userStoryStatus.nonCritical.total
                                          ).toFixed(2)
                                        : '0.00'}
                                    %
                                </Typography>
                                {renderProgress(
                                    userStoryStatus.nonCritical.total,
                                    userStoryStatus.nonCritical.correct,
                                    'secondary',
                                )}
                                {userStoryStatus.nonCritical.waiting === 1 && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {userStoryStatus.nonCritical.waiting}
                                        {t('plugin_find_truman_poll_to_be_revealed')}
                                    </Typography>
                                )}
                                {userStoryStatus.nonCritical.waiting > 1 && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {userStoryStatus.nonCritical.waiting}
                                        {t('plugin_find_truman_polls_to_be_revealed')}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </CardContent>
    )
}
