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
import type { PollResult, PuzzleResult, UserPollStatus } from '../types'
import { PostType } from '../types'
import { useContext, useState } from 'react'
import { FindTrumanContext } from '../context'
import { makeStyles } from '@masknet/theme'

export const BorderLinearProgress: any = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
    },
}))

const useResultStyles = makeStyles()((theme) => ({
    answerChip: {
        backgroundColor: theme.palette.mode === 'light' ? '#2e7d32' : '#66bb6a',
        color: theme.palette.mode === 'light' ? '#fff' : '#EFF3F4',
    },
}))

interface ResultViewProps {
    type: PostType
    userStatus?: UserPollStatus
    result?: PuzzleResult | PollResult
}
export default function ResultCard(props: ResultViewProps) {
    const { type, userStatus, result } = props
    const { classes } = useResultStyles()
    const [choice] = useState(userStatus ? userStatus.choice : -1)

    const { t } = useContext(FindTrumanContext)

    const total =
        result?.count && result.count.length > 0
            ? result.count.reduce((total, e) => ({ choice: -1, value: total.value + e.value })).value
            : 1

    const answer = result
        ? type === PostType.PuzzleResult
            ? (result as PuzzleResult).correct
            : (result as PollResult).result
        : -1

    return (
        <CardContent>
            {answer === -1 && (
                <Alert severity="info">
                    {t(
                        type === PostType.PuzzleResult
                            ? 'plugin_find_truman_puzzle_underway'
                            : 'plugin_find_truman_voting_underway',
                    )}
                </Alert>
            )}
            {answer !== -1 && result && (
                <>
                    <Typography variant="h6" color="textPrimary" paddingLeft={1} paddingRight={1} marginBottom={2}>
                        {result.question}
                    </Typography>
                    {result.options.map((option, index) => {
                        const value = result.count.find((e) => e.choice === index)?.value || 0
                        const percent = (total > 0 ? (value * 100) / total : 0).toFixed(2)
                        return (
                            <Card
                                variant="outlined"
                                key={option}
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
                                            size="small"
                                            label={`${value} ${t(
                                                value > 1 ? 'plugin_find_truman_votes' : 'plugin_find_truman_vote',
                                            )}`}
                                        />
                                        <Typography color="textPrimary" sx={{ fontSize: '13px', lineHeight: '24px' }}>
                                            {option}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        {choice === index && (
                                            <Chip
                                                icon={<Adjust />}
                                                size="small"
                                                color="primary"
                                                label={t('plugin_find_truman_selected')}
                                            />
                                        )}
                                        {answer === index && (
                                            <Chip
                                                icon={<CheckCircle />}
                                                className={classes.answerChip}
                                                color="success"
                                                size="small"
                                                label={t(
                                                    type === PostType.PuzzleResult
                                                        ? 'plugin_find_truman_answer'
                                                        : 'plugin_find_truman_result',
                                                )}
                                            />
                                        )}
                                    </Stack>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', columnGap: '16px' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <BorderLinearProgress value={Number(percent)} variant="determinate" />
                                    </Box>
                                    <Box sx={{ width: 54 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {percent}%
                                        </Typography>
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
