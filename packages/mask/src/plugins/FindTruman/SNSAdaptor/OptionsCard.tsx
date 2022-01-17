import type { PuzzleCondition, UserPollStatus } from '../types'
import { useContext, useEffect, useRef, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Alert, Box, Card, CardContent, Chip, Snackbar, Typography } from '@mui/material'
import { RadioButtonChecked, RadioButtonUnchecked, DoneOutlined, Send, RefreshOutlined } from '@mui/icons-material'
import NoNftCard from './NoNftCard'
import { useChainId } from '@masknet/web3-shared-evm'
import { FindTrumanContext } from '../context'
import { BorderLinearProgress } from './ResultCard'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'

const useOptionsStyles = makeStyles()((theme) => {
    return {
        progressOption: {
            transition: 'all .5s',
            padding: '12px 18px',
            borderRadius: '16px',
            '&:hover': {
                background: `rgba(28, 23, 26, ${theme.palette.mode === 'dark' ? '.75' : '.05'})`,
            },
            '&:active': {
                background: `rgba(28, 23, 26, ${theme.palette.mode === 'dark' ? '.15' : '.15'})`,
            },
            ':not(:last-child)': {
                marginBottom: '8px',
            },
        },
        blockChip: {
            width: '100%',
            marginBottom: 8,
            justifyContent: 'space-between',
            minHeight: '39px',
            height: 'fit-content',
            fontSize: '13px',
            padding: '8px',
            transition: 'all .3s',
        },
        checkIcon: {},
        horizontalScrollBar: {
            '::-webkit-scrollbar': {
                backgroundColor: 'transparent',
                height: '8px',
            },
            '::-webkit-scrollbar-thumb:horizontal': {
                backgroundColor: theme.palette.divider,
                borderRadius: '16px',
                border: `6px solid ${theme.palette.divider}`,
            },
        },
        verticalScrollBar: {
            '::-webkit-scrollbar': {
                backgroundColor: 'transparent',
                width: '6px',
            },
            '::-webkit-scrollbar-thumb:vertical': {
                backgroundColor: theme.palette.divider,
                borderRadius: '16px',
                border: `6px solid ${theme.palette.divider}`,
            },
        },
    }
})
interface OptionsViewProps {
    userStatus?: UserPollStatus
    onSubmit(choice: number): Promise<boolean>
}
export default function OptionsCard(props: OptionsViewProps) {
    const { userStatus, onSubmit } = props
    const [selected, setSelected] = useState(true)
    const [choice, setChoice] = useState(userStatus ? userStatus.choice : -1)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<'' | 'insufficient-nft'>('')
    const [unmeetCondition, setUnmeetCondition] = useState<PuzzleCondition[]>([])
    const [snackVisible, setSnackVisible] = useState(false)

    const { classes } = useOptionsStyles()
    const chainId = useChainId()
    const { t } = useContext(FindTrumanContext)
    const parentRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        setError('')
        setUnmeetCondition(userStatus?.notMeetConditions || [])
        userStatus && userStatus.notMeetConditions.length > 0 && setError('insufficient-nft')
    }, [chainId, userStatus])

    useEffect(() => {
        setChoice(userStatus ? userStatus.choice : -1)
        setSelected(userStatus ? userStatus.choice !== -1 : true)
    }, [userStatus])

    const renderOptions = (userStatus: UserPollStatus) => {
        const showCount = !!userStatus.count
        const total = userStatus.count
            ? userStatus.count.reduce((total, e) => {
                  return { choice: -1, value: total.value + e.value }
              }).value
            : 0
        return userStatus.options.map((option, index) => {
            const count = userStatus.count ? userStatus.count.find((e) => e.choice === index)?.value || 0 : 0
            const percent = (total > 0 ? (count * 100) / total : 0).toFixed(2)

            return !!userStatus.count ? (
                <Card
                    sx={choice !== index ? { cursor: 'pointer' } : {}}
                    className={classes.progressOption}
                    variant="outlined"
                    key={option}
                    onClick={
                        !selected && !error && userStatus.status !== 0
                            ? () => {
                                  setChoice(index)
                              }
                            : undefined
                    }>
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
                                label={`${count} ${t(
                                    count > 1 ? 'plugin_find_truman_votes' : 'plugin_find_truman_vote',
                                )}`}
                            />
                            <Typography color="textPrimary" sx={{ fontSize: '13px', lineHeight: '24px' }}>
                                {option}
                            </Typography>
                        </Box>
                        {choice === index ? (
                            <Chip
                                icon={<RadioButtonChecked />}
                                size="small"
                                color="primary"
                                label={t('plugin_find_truman_selected')}
                            />
                        ) : selected ? null : (
                            <Chip
                                sx={{ cursor: 'pointer' }}
                                icon={<RadioButtonUnchecked />}
                                size="small"
                                color="default"
                                label={t('plugin_find_truman_unselect')}
                            />
                        )}
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
            ) : (
                <Box key={index} sx={{ position: 'relative' }}>
                    <Chip
                        id="submit"
                        className={classes.blockChip}
                        label={
                            <div
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                }}>
                                {option}
                            </div>
                        }
                        onClick={
                            !selected && !error && userStatus.status !== 0
                                ? () => {
                                      setChoice(index)
                                  }
                                : undefined
                        }
                        disabled={submitting}
                        deleteIcon={choice === index ? <DoneOutlined /> : undefined}
                        onDelete={choice === index ? () => {} : undefined}
                        color={showCount ? 'default' : choice === index ? 'primary' : 'default'}
                        variant={showCount ? 'outlined' : choice === index ? 'filled' : 'outlined'}
                    />
                </Box>
            )
        })
    }

    const renderSubmitButton = (userStatus: UserPollStatus) => {
        const isClosed = userStatus.status === 0
        return (
            <div style={{ textAlign: 'right', marginTop: '8px', paddingBottom: '8px' }}>
                <ActionButtonPromise
                    color={selected ? 'success' : 'primary'}
                    variant="contained"
                    disabled={selected || isClosed || choice === -1}
                    init={t(
                        selected
                            ? 'plugin_find_truman_submitted'
                            : isClosed
                            ? 'plugin_find_truman_vote_finish'
                            : 'plugin_find_truman_submit',
                    )}
                    waiting={t('plugin_find_truman_submitting')}
                    failed={t('plugin_find_truman_submit_failed')}
                    complete={t('plugin_find_truman_submitted')}
                    executor={async () => {
                        setSubmitting(true)
                        await onSubmit(choice)
                        setSubmitting(false)
                    }}
                    failedOnClick="use executor"
                    startIcon={isClosed || submitting || selected ? undefined : <Send />}
                    completeIcon={<DoneOutlined />}
                    failIcon={<RefreshOutlined />}
                />
            </div>
        )
    }

    return (
        <CardContent ref={parentRef}>
            <Snackbar
                autoHideDuration={2000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackVisible}
                onClose={() => setSnackVisible(false)}>
                <Alert onClose={() => setSnackVisible(false)} variant="filled" severity="error" sx={{ width: '100%' }}>
                    {t('plugin_find_truman_submit_failed')}
                </Alert>
            </Snackbar>
            {userStatus && (
                <>
                    <Typography variant="h6" color="textPrimary" paddingLeft={1} paddingRight={1} marginBottom={2}>
                        {userStatus.question}
                    </Typography>
                    {renderOptions(userStatus)}
                    {!error && renderSubmitButton(userStatus)}
                    {unmeetCondition.length > 0 && (
                        <>
                            <Alert severity="info" sx={{ mb: 1 }}>
                                {t('plugin_find_truman_insufficient_nft')}
                            </Alert>
                            <NoNftCard conditions={unmeetCondition} />
                        </>
                    )}
                </>
            )}
        </CardContent>
    )
}
