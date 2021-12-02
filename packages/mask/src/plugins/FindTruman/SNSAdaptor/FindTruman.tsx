import { useContext, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { FindTrumanContext } from '../context'
import { Alert, Box, Card, CardHeader, CardMedia, Chip, Skeleton, Typography } from '@mui/material'
import type { PollResult, PuzzleResult, StoryInfo, UserPollStatus, UserPuzzleStatus, UserStoryStatus } from '../types'
import { FindTrumanPostType } from '../types'
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

interface FindTrumanProps {
    postType: FindTrumanPostType
    encryptionPayload: string
    storyInfo?: StoryInfo
    userStoryStatus?: UserStoryStatus
    userPuzzleStatus?: UserPuzzleStatus
    userPollStatus?: UserPollStatus
    puzzleResult?: PuzzleResult
    pollResult?: PollResult
    onSubmit: (choice: number) => Promise<boolean>
}

export function FindTruman(props: FindTrumanProps) {
    const { classes } = useStyles()
    const { address } = useContext(FindTrumanContext)
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
    const notVoted =
        (userPuzzleStatus && userPuzzleStatus.choice === -1) || (userPollStatus && userPollStatus.choice === -1)

    return (
        <Card className={classes.root} elevation={0}>
            {postType !== FindTrumanPostType.Encryption ? (
                <>
                    <CardMedia
                        onLoad={() => {
                            setLoadImg(false)
                        }}
                        alt=""
                        component="img"
                        height={140}
                        sx={{
                            visibility: loadImg ? 'hidden' : 'visible',
                        }}
                        image={storyInfo?.img}
                    />
                    {loadImg && (
                        <Box sx={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%' }}>
                            <Skeleton animation="wave" variant="rectangular" height={140} width="100%" />
                        </Box>
                    )}
                    <CardHeader
                        title={
                            storyInfo && (
                                <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                                    <Typography className={classes.title} component="b" sx={{ marginRight: 0.5 }}>
                                        {storyInfo.name}
                                    </Typography>
                                    <Box>
                                        {notVoted && (
                                            <Chip
                                                sx={{ marginRight: '8px' }}
                                                size="small"
                                                label={t('plugin_find_truman_have_not_voted')}
                                                color="default"
                                                variant="filled"
                                            />
                                        )}
                                        {voted && (
                                            <Chip
                                                sx={{ marginRight: '8px' }}
                                                size="small"
                                                label={t('plugin_find_truman_have_voted')}
                                                color="success"
                                                variant="filled"
                                            />
                                        )}
                                        <Chip
                                            color="primary"
                                            size="small"
                                            label={t(`plugin_find_truman_status_${postType}`)}
                                        />
                                    </Box>
                                </Box>
                            )
                        }
                    />
                    {postType === FindTrumanPostType.Status && <StageCard userStoryStatus={userStoryStatus} />}
                    {postType === FindTrumanPostType.Puzzle && userPuzzleStatus && (
                        <OptionsCard
                            type={FindTrumanPostType.Puzzle}
                            onSubmit={onSubmit}
                            userStatus={userPuzzleStatus}
                        />
                    )}
                    {postType === FindTrumanPostType.Poll && userPollStatus && (
                        <OptionsCard type={FindTrumanPostType.Poll} onSubmit={onSubmit} userStatus={userPollStatus} />
                    )}
                    {(postType === FindTrumanPostType.PuzzleResult || postType === FindTrumanPostType.PollResult) &&
                        (puzzleResult || pollResult) && (
                            <ResultCard
                                type={postType}
                                userStatus={userPuzzleStatus || userPollStatus}
                                result={puzzleResult || pollResult}
                            />
                        )}
                </>
            ) : (
                <EncryptionCard payload={encryptionPayload} />
            )}
            {!address && (
                <Box sx={{ padding: '0 16px' }}>
                    <Alert severity="info">{t('plugin_find_truman_connect_wallet_tip')}</Alert>
                </Box>
            )}
            <Footer />
        </Card>
    )
}
