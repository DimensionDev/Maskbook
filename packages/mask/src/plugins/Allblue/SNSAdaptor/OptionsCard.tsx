import type { PuzzleCondition, UserPollStatus, UserPuzzleStatus } from '../types'
import { AllbluePostType } from '../types'
import { useContext, useEffect, useRef, useState } from 'react'
import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'
import { Alert, Box, Card, CardContent, Chip, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material'
import { Adjust, DoneOutlined, Send } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import NoNftCard from './NoNftCard'
import { createContract, useChainId, useWeb3 } from '../../../../../web3-shared/evm'
import { AllblueContext } from '../context'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { AbiItem } from 'web3-utils'
import { BorderLinearProgress } from './ResultCard'

const useOptionsStyles = makeStyles()((theme) => {
    return {
        progressOption: {
            cursor: 'pointer',
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
            color: '#fff',
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
    type: AllbluePostType
    userStatus?: UserPuzzleStatus | UserPollStatus
    onSubmit: (choice: number) => Promise<boolean>
}
export default function OptionsCard(props: OptionsViewProps) {
    const { type, userStatus, onSubmit } = props
    const [selected, setSelected] = useState<boolean>(true)
    const [choice, setChoice] = useState<number>(userStatus ? userStatus.choice : -1)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<'' | 'unsupported-chain' | 'insufficient-nft'>('')
    const [unmeetCondition, setUnmeetCondition] = useState<PuzzleCondition[]>([])
    // const [verticalStepper] = useState<boolean>(document.body.clientWidth < 420)

    const { classes } = useOptionsStyles()
    const chainId = useChainId()
    const { address: account } = useContext(AllblueContext)
    const web3 = useWeb3(false)
    const { t } = useI18N()
    const ref = useRef<HTMLDivElement | null>(null)
    const parentRef = useRef<HTMLDivElement | null>(null)

    // let href: string = ''
    // let interval: any
    // useEffect(() => {
    //     interval = setInterval(() => {
    //         let newHref = window.location.href
    //         setTimeout(() => {
    //             if (type === AllbluePostType.Poll && newHref !== href && ref?.current) {
    //                 ref.current.scrollTo(
    //                     verticalStepper
    //                         ? {
    //                               top: ref.current.scrollHeight,
    //                               behavior: 'smooth',
    //                           }
    //                         : {
    //                               left: ref.current.scrollWidth,
    //                               behavior: 'smooth',
    //                           },
    //                 )
    //                 href = newHref
    //             }
    //         }, 500)
    //     }, 1000)
    //     return () => {
    //         interval && clearInterval(interval)
    //     }
    // }, [])

    useEffect(() => {
        checkCondition()
    }, [chainId, userStatus])

    useEffect(() => {
        setSelected(userStatus ? userStatus.choice !== -1 : true)
        setTimeout(() => {
            type === AllbluePostType.Poll &&
                ref?.current?.scrollTo({
                    left: ref.current.scrollWidth,
                    behavior: 'smooth',
                })
        }, 500)
    }, [userStatus])

    const checkCondition = async () => {
        if (userStatus) {
            for (const condition of userStatus.conditions) {
                if (condition.chainId !== chainId) {
                    setError('unsupported-chain')
                    return
                }
            }
            let _unmeetCondition: PuzzleCondition[] = []
            for (const condition of userStatus.conditions) {
                const { type, address, minAmount } = condition
                switch (type) {
                    case 'hold-erc721':
                        const contract = createContract<ERC721>(web3, address, ERC721ABI as AbiItem[])
                        const res = contract && (await contract.methods.balanceOf(account).call())
                        if (Number(res) < minAmount) {
                            setError('insufficient-nft')
                            _unmeetCondition.push(condition)
                        }
                        break
                    case 'hold-erc1155':
                        break
                }
            }
            setUnmeetCondition(_unmeetCondition)
        }
    }

    const renderOptions = (userStatus: UserPuzzleStatus | UserPollStatus) => {
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
                    className={classes.progressOption}
                    variant={'outlined'}
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
                                size={'small'}
                                label={`${count}${t('plugin_allblue_votes')}`}
                            />
                            <Typography color="textPrimary" sx={{ fontSize: '13px', lineHeight: '24px' }}>
                                {option}
                            </Typography>
                        </Box>
                        {choice === index && (
                            <Chip
                                icon={<Adjust />}
                                size={'small'}
                                color={'primary'}
                                label={t('plugin_allblue_selected')}
                            />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <BorderLinearProgress value={Number(percent)} variant={'determinate'} />
                        </Box>
                        <Box sx={{ minWidth: 52, display: 'flex', justifyContent: 'flex-end' }}>
                            <Typography variant="body2" color="text.secondary">{`${percent}%`}</Typography>
                        </Box>
                    </Box>
                </Card>
            ) : (
                <Box key={index} sx={{ position: 'relative' }}>
                    <Chip
                        id={'submit'}
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

    const renderSubmitButton = (userStatus: UserPuzzleStatus | UserPollStatus) => {
        return (
            <div style={{ textAlign: 'right', marginTop: '8px', paddingBottom: '8px' }}>
                <LoadingButton
                    disabled={userStatus.status === 0 || choice === -1}
                    onClick={() => {
                        setSubmitting(true)
                        onSubmit(choice)
                            .then((res) => {
                                setSubmitting(false)
                            })
                            .catch((error_) => {
                                setSubmitting(false)
                            })
                    }}
                    endIcon={<Send />}
                    loading={submitting}
                    loadingPosition="end"
                    variant="contained">
                    {t(userStatus.status === 0 ? 'plugin_allblue_vote_finish' : 'plugin_allblue_submit')}
                </LoadingButton>
            </div>
        )
    }

    const renderStepper = (userStatus: UserPuzzleStatus | UserPollStatus, vertical: boolean) => {
        return (
            <div
                ref={ref}
                className={vertical ? classes.verticalScrollBar : classes.horizontalScrollBar}
                style={vertical ? { overflowY: 'auto' } : { overflowX: 'auto' }}>
                <div
                    style={
                        vertical
                            ? {
                                  maxHeight:
                                      (userStatus as UserPollStatus).history.length > 0
                                          ? (userStatus as UserPollStatus).history.length * 200
                                          : '100%',
                              }
                            : {
                                  width:
                                      (userStatus as UserPollStatus).history.length > 0
                                          ? (userStatus as UserPollStatus).history.length * 800
                                          : '100%',
                              }
                    }>
                    <Stepper
                        activeStep={(userStatus as UserPollStatus).history.length}
                        orientation={vertical ? 'vertical' : 'horizontal'}
                        alternativeLabel={!vertical}>
                        {(userStatus as UserPollStatus).history.map((e, index) => {
                            return vertical ? (
                                <Step key={index} completed={false} expanded={true}>
                                    <StepLabel>
                                        <Typography variant="h6" color={'text.primary'} gutterBottom={false}>
                                            {e.poll}
                                        </Typography>
                                    </StepLabel>
                                    <StepContent>
                                        <Alert
                                            icon={false}
                                            severity="info"
                                            sx={{ textAlign: 'left', padding: '2px 8px', borderRadius: '6px' }}>
                                            {e.result}
                                        </Alert>
                                    </StepContent>
                                </Step>
                            ) : (
                                <Step key={index} completed={false}>
                                    <StepLabel>
                                        <Box>
                                            <Typography variant="h6" color={'text.primary'} gutterBottom={false}>
                                                {e.poll}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Alert
                                                    icon={false}
                                                    severity="info"
                                                    sx={{ textAlign: 'left', width: 250 }}>
                                                    {e.result}
                                                </Alert>
                                            </Box>
                                        </Box>
                                    </StepLabel>
                                </Step>
                            )
                        })}
                        {vertical ? (
                            <Step key={'latest'} completed={false} expanded={true}>
                                <StepLabel>
                                    <Box>
                                        <Typography variant="h6" color={'text.primary'} gutterBottom={true}>
                                            {userStatus.question}
                                        </Typography>
                                    </Box>
                                </StepLabel>
                                <StepContent>
                                    {renderOptions(userStatus)}
                                    {!error && !selected && renderSubmitButton(userStatus)}
                                </StepContent>
                            </Step>
                        ) : (
                            <Step key={'latest'} completed={false}>
                                <StepLabel>
                                    <Box>
                                        <Typography variant="h6" color={'text.primary'} gutterBottom={true}>
                                            {userStatus.question}
                                        </Typography>
                                        {renderOptions(userStatus)}
                                        {!error && !selected && renderSubmitButton(userStatus)}
                                    </Box>
                                </StepLabel>
                            </Step>
                        )}
                    </Stepper>
                </div>
            </div>
        )
    }

    return (
        <CardContent ref={parentRef}>
            {userStatus && (
                <>
                    {/*{type === AllbluePostType.Poll && renderStepper(userStatus, verticalStepper)}*/}
                    {(type === AllbluePostType.Puzzle || type === AllbluePostType.Poll) && (
                        <>
                            {renderOptions(userStatus)}
                            {!error && !selected && renderSubmitButton(userStatus)}
                        </>
                    )}
                    {error === 'unsupported-chain' && (
                        <Alert severity="warning">{`${t('plugin_allblue_unsupported_chain', {
                            chain: userStatus.conditions[0]?.chain || '',
                        })}`}</Alert>
                    )}
                    {error === 'insufficient-nft' && (
                        <Alert severity="info">{t('plugin_allblue_insufficient_nft')}</Alert>
                    )}
                    {error === 'insufficient-nft' && userStatus.status === 1 && (
                        <NoNftCard conditions={unmeetCondition} />
                    )}
                </>
            )}
        </CardContent>
    )
}
