import type { CompletionQuestionItem, UserCompletionStatus, CompletionQuestionAnswer } from '../types'
import { Alert, Box, Button, CardContent, Snackbar, TextField, Typography } from '@mui/material'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FindTrumanContext } from '../context'
import { makeStyles } from '@masknet/theme'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { DoneOutlined, RefreshOutlined, Send, CheckRounded, ClearRounded, KeyRounded } from '@mui/icons-material'
import NoNftCard from './NoNftCard'

const useStyles = makeStyles()((theme, props) => ({
    successButton: {
        backgroundColor: theme.palette.mode === 'light' ? '#2e7d32' : '#66bb6a',
        color: theme.palette.mode === 'light' ? '#fff' : 'rgba(0, 0, 0, .87)',
        '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? '#1B5E20' : '#388E3C',
        },
    },
    errorButton: {},
    helperText: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
    },
    helperTextIcon: {
        marginRight: '8px',
        fontSize: '20px',
    },
    helperTextContent: {
        fontSize: '14px',
    },
}))

interface CompletionCardProps {
    completionStatus?: UserCompletionStatus
    onSubmit(quesId: string, answers: CompletionQuestionAnswer[]): Promise<void>
}
export default function CompletionCard(props: CompletionCardProps) {
    const { completionStatus, onSubmit } = props
    const [submitted, setSubmitted] = useState(completionStatus?.answered)
    const [questions, setQuestions] = useState<CompletionQuestionItem[]>(completionStatus?.questions ?? [])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<'' | 'insufficient-nft'>('')
    const [snackVisible, setSnackVisible] = useState(false)

    const { t } = useContext(FindTrumanContext)
    const { classes } = useStyles()

    useEffect(() => {
        setError('')
        if (!completionStatus) return
        setQuestions(completionStatus.questions)
        setSubmitted(completionStatus.answered)
        !!completionStatus.notMeetConditions.length && setError('insufficient-nft')
    }, [completionStatus])

    const handleSubmit = useCallback(async () => {
        setSubmitting(true)
        try {
            await onSubmit(
                completionStatus?.id ?? '',
                questions.map((e) => ({
                    id: e.id,
                    answer: e.answer || '',
                })),
            )
        } finally {
            setSubmitting(false)
        }
    }, [questions.map((e) => e.answer).join(',')])

    const enabled = useMemo(() => {
        return (
            completionStatus &&
            !completionStatus.answersPublished &&
            !submitting &&
            completionStatus.notMeetConditions.length === 0
        )
    }, [completionStatus, submitting])

    const isClosed = useMemo(() => !!completionStatus?.answersPublished, [completionStatus])

    return (
        <CardContent>
            <Snackbar
                autoHideDuration={2000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackVisible}
                onClose={() => setSnackVisible(false)}>
                <Alert onClose={() => setSnackVisible(false)} variant="filled" severity="error" sx={{ width: '100%' }}>
                    {t('plugin_find_truman_submit_failed')}
                </Alert>
            </Snackbar>
            {completionStatus && (
                <>
                    <Typography variant="h6" color="textPrimary" paddingLeft={1} paddingRight={1} marginBottom={2}>
                        {completionStatus.title}
                    </Typography>
                    <Box marginBottom={2}>
                        {questions.map((question, index) => (
                            <Box key={question.id} marginBottom={2}>
                                {completionStatus.answersPublished ? (
                                    <TextField
                                        fullWidth
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        size="small"
                                        focused
                                        variant="outlined"
                                        color={question.correct ? 'success' : 'error'}
                                        error={!question.correct}
                                        value={question.answer ?? ''}
                                        label={question.title}
                                        helperText={
                                            <span className={classes.helperText}>
                                                <KeyRounded className={classes.helperTextIcon} />
                                                <span className={classes.helperTextContent}>
                                                    {question.correctAnswer ?? ''}
                                                </span>
                                            </span>
                                        }
                                    />
                                ) : completionStatus.answered ? (
                                    <TextField
                                        fullWidth
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        size="small"
                                        variant="outlined"
                                        label={question.title}
                                        value={question.answer ?? ''}
                                    />
                                ) : (
                                    <TextField
                                        fullWidth
                                        required
                                        disabled={!enabled && !submitted}
                                        InputProps={{
                                            readOnly: submitted,
                                        }}
                                        size="small"
                                        variant="outlined"
                                        placeholder={t('plugin_find_truman_completion_placeholder')}
                                        label={question.title}
                                        value={questions[index].answer ?? ''}
                                        onChange={({ currentTarget }) => {
                                            const ques = [...questions]
                                            ques[index].answer = currentTarget.value
                                            setQuestions(ques)
                                        }}
                                    />
                                )}
                            </Box>
                        ))}
                    </Box>
                    {!error && (
                        <Box textAlign="right" marginTop={1} paddingBottom={1}>
                            {submitted ? (
                                <Button
                                    className={completionStatus.correct ? classes.successButton : classes.errorButton}
                                    startIcon={completionStatus.correct ? <CheckRounded /> : <ClearRounded />}
                                    color={completionStatus.correct ? 'success' : 'error'}>
                                    {completionStatus.correct
                                        ? t('plugin_find_truman_completion_correct')
                                        : t('plugin_find_truman_completion_wrong')}
                                </Button>
                            ) : (
                                <ActionButtonPromise
                                    color="primary"
                                    disabled={!enabled}
                                    init={t(
                                        isClosed
                                            ? 'plugin_find_truman_completion_closed'
                                            : 'plugin_find_truman_completion_submit',
                                    )}
                                    waiting={t('plugin_find_truman_completion_submitting')}
                                    failed={t('plugin_find_truman_submit_failed')}
                                    complete={t('plugin_find_truman_completion_submitted')}
                                    executor={handleSubmit}
                                    failedOnClick="use executor"
                                    startIcon={isClosed ? undefined : <Send />}
                                    completeIcon={<DoneOutlined />}
                                    failIcon={<RefreshOutlined />}
                                />
                            )}
                        </Box>
                    )}
                    {completionStatus.notMeetConditions.length > 0 && (
                        <Box>
                            <Alert severity="info" sx={{ mb: 1 }}>
                                {t('plugin_find_truman_insufficient_nft')}
                            </Alert>
                            <NoNftCard conditions={completionStatus.notMeetConditions} />
                        </Box>
                    )}
                </>
            )}
        </CardContent>
    )
}
