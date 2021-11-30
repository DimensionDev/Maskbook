import {
    Alert,
    Box,
    CardContent,
    Chip,
    LinearProgress,
    linearProgressClasses,
    Stack,
    styled,
    Typography,
    Card,
} from '@mui/material'
import { Adjust, CheckCircle } from '@mui/icons-material'
import type { PollResult, PuzzleResult, UserPollStatus, UserPuzzleStatus } from '../types'
import { AllbluePostType } from '../types'
import { useState } from 'react'
import { useI18N } from '../../../utils'

export const BorderLinearProgress: any = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        // backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
    },
}))

interface ResultViewProps {
    type: AllbluePostType
    userStatus?: UserPuzzleStatus | UserPollStatus
    result?: PuzzleResult | PollResult
}
export default function ResultCard(props: ResultViewProps) {
    const { type, userStatus, result } = props
    const [choice] = useState<number>(userStatus ? userStatus.choice : -1)

    const { t } = useI18N()

    const total =
        result?.count && result.count.length > 0
            ? result.count.reduce((total, e) => {
                  return { choice: -1, value: total.value + e.value }
              }).value
            : 1

    const answer = result
        ? type === AllbluePostType.PuzzleResult
            ? (result as PuzzleResult).correct
            : (result as PollResult).result
        : -1

    return (
        <CardContent>
            {answer === -1 && (
                <Alert severity="info">
                    {t(
                        type === AllbluePostType.PuzzleResult
                            ? 'plugin_allblue_puzzle_underway'
                            : 'plugin_allblue_voting_underway',
                    )}
                </Alert>
            )}
            {answer !== -1 && result && (
                <>
                    <Typography color="textPrimary" marginBottom={2}>
                        {result.question}
                    </Typography>
                    {result.options.map((option, index) => {
                        const value = result.count.find((e) => e.choice === index)?.value || 0
                        const percent = (total > 0 ? (value * 100) / total : 0).toFixed(2)
                        return (
                            <Card
                                variant={'outlined'}
                                key={option}
                                // marginBottom={1}
                                sx={{
                                    padding: '12px 18px',
                                    borderRadius: '16px',
                                    marginBottom: 1,
                                }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        rowGap: '8px',
                                        flexWrap: 'wrap',
                                        justifyContent: 'space-between',
                                        marginBottom: 1,
                                    }}>
                                    <Box sx={{ display: 'flex', alignItems: 'top' }}>
                                        <Chip
                                            sx={{ marginRight: '8px' }}
                                            size={'small'}
                                            label={`${value} ${t(
                                                value > 1 ? 'plugin_allblue_votes' : 'plugin_allblue_vote',
                                            )}`}
                                        />
                                        <Typography color="textPrimary" sx={{ fontSize: '13px', lineHeight: '24px' }}>
                                            {option}
                                        </Typography>
                                    </Box>
                                    <Stack direction={'row'} spacing={1}>
                                        {choice === index && (
                                            <Chip
                                                icon={<Adjust />}
                                                size={'small'}
                                                color={'primary'}
                                                label={t('plugin_allblue_selected')}
                                            />
                                        )}
                                        {answer === index && (
                                            <Chip
                                                icon={<CheckCircle />}
                                                color={'success'}
                                                size={'small'}
                                                label={t(
                                                    type === AllbluePostType.PuzzleResult
                                                        ? 'plugin_allblue_answer'
                                                        : 'plugin_allblue_result',
                                                )}
                                            />
                                        )}
                                    </Stack>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <BorderLinearProgress value={Number(percent)} variant={'determinate'} />
                                    </Box>
                                    <Box sx={{ minWidth: 50, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Typography variant="body2" color="text.secondary">{`${percent}%`}</Typography>
                                    </Box>
                                </Box>
                            </Card>
                        )
                    })}
                </>
            )}
        </CardContent>
    )
}
