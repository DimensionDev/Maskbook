import { useContext, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { AllblueContext } from '../context'
import { Alert, Box, Card, CardContent, CardHeader, CardMedia, Chip, Skeleton, Typography } from '@mui/material'
import type { PollResult, PuzzleResult, StoryInfo, UserPollStatus, UserPuzzleStatus, UserStoryStatus } from '../types'
import { AllbluePostType } from '../types'
import { useI18N } from '../../../utils'
import ResultCard from './ResultCard'
import OptionsCard from './OptionsCard'
import Footer from './Footer'
import StageCard from './StageCard'
import EncryptionCard from './EncryptionCard'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            '--contentHeight': '400px',
            '--tabHeight': '35px',

            width: '100%',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
            position: 'relative',
        },
        content: {
            width: '100%',
            minHeight: 'var(--contentHeight)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 !important',
        },
        body: {
            flex: 1,
            maxHeight: 'calc(var(--contentHeight) - var(--tabHeight))',
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tabs: {
            height: 'var(--tabHeight)',
            width: '100%',
            minHeight: 'unset',
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
        },
        tab: {
            height: 'var(--tabHeight)',
            minHeight: 'unset',
            minWidth: 'unset',
        },
        subtitle: {
            fontSize: 12,
            marginRight: theme.spacing(0.5),
        },
        title: {
            fontSize: '1.25rem',
        },
        subheader: {
            fontSize: '0.875rem',
        },
        tip: {
            padding: theme.spacing(1),
            backgroundColor: '#fff',
        },
        tipArrow: {
            color: '#fff',
        },
    }
})

interface AllblueProps {
    postType: AllbluePostType
    encryptionPayload: string
    storyInfo?: StoryInfo
    userStoryStatus?: UserStoryStatus
    userPuzzleStatus?: UserPuzzleStatus
    userPollStatus?: UserPollStatus
    puzzleResult?: PuzzleResult
    pollResult?: PollResult
    onSubmit: (choice: number) => Promise<boolean>
}

export function Allblue(props: AllblueProps) {
    const { classes } = useStyles()
    const { address } = useContext(AllblueContext)
    const {
        postType,
        encryptionPayload,
        storyInfo,
        userStoryStatus,
        userPuzzleStatus,
        userPollStatus,
        puzzleResult,
        pollResult,
        onSubmit,
    } = props
    const { t } = useI18N()

    const [loadImg, setLoadImg] = useState<boolean>(true)

    const voted =
        (userPuzzleStatus && userPuzzleStatus.choice !== -1) || (userPollStatus && userPollStatus.choice !== -1)
    const unvoted =
        (userPuzzleStatus && userPuzzleStatus.choice === -1) || (userPollStatus && userPollStatus.choice === -1)

    return (
        <Card className={classes.root} elevation={0}>
            {postType !== AllbluePostType.Encryption ? (
                <>
                    <CardMedia
                        onLoad={() => {
                            setLoadImg(false)
                        }}
                        alt={''}
                        component="img"
                        height={140}
                        sx={{
                            visibility: loadImg ? 'hidden' : 'visible',
                        }}
                        image={storyInfo?.img}
                    />
                    {loadImg && (
                        <Box sx={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%' }}>
                            <Skeleton animation="wave" variant="rectangular" height={140} width={'100%'} />
                        </Box>
                    )}
                    <CardHeader
                        title={
                            storyInfo && (
                                <Box
                                    display="flex"
                                    flexWrap={'wrap'}
                                    alignItems="center"
                                    justifyContent="space-between">
                                    <Typography className={classes.title} component="b" sx={{ marginRight: 0.5 }}>
                                        {storyInfo.name}
                                    </Typography>
                                    <Box>
                                        {unvoted && (
                                            <Chip
                                                sx={{ marginRight: '8px', color: '#fff' }}
                                                size="small"
                                                label={t('plugin_allblue_have_not_voted')}
                                                color="default"
                                                variant="filled"
                                            />
                                        )}
                                        {voted && (
                                            <Chip
                                                sx={{ marginRight: '8px', color: '#fff' }}
                                                size="small"
                                                label={t('plugin_allblue_have_voted')}
                                                color="success"
                                                variant="filled"
                                            />
                                        )}
                                        <Chip
                                            color="primary"
                                            size="small"
                                            label={t(`plugin_allblue_status_${postType}`)}
                                        />
                                    </Box>
                                </Box>
                            )
                        }
                    />
                    {postType === AllbluePostType.Status && <StageCard userStoryStatus={userStoryStatus} />}
                    {postType === AllbluePostType.Puzzle && userPuzzleStatus && (
                        <OptionsCard type={AllbluePostType.Puzzle} onSubmit={onSubmit} userStatus={userPuzzleStatus} />
                    )}
                    {postType === AllbluePostType.Poll && userPollStatus && (
                        <OptionsCard type={AllbluePostType.Poll} onSubmit={onSubmit} userStatus={userPollStatus} />
                    )}
                    {(postType === AllbluePostType.PuzzleResult || postType === AllbluePostType.PollResult) &&
                        (puzzleResult || pollResult) && (
                            <ResultCard
                                type={postType}
                                userStatus={userPuzzleStatus || userPollStatus}
                                result={puzzleResult || pollResult}
                            />
                        )}
                    {!address && (
                        <CardContent>
                            <Alert severity="info">{t('plugin_allblue_connect_wallet_tip')}</Alert>
                        </CardContent>
                    )}
                </>
            ) : (
                <EncryptionCard payload={encryptionPayload} />
            )}
            <Footer />
        </Card>
    )
}
