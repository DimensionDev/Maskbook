import { useContext, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { FindTrumanContext } from '../context'
import { Alert, Box, Card, CardHeader, CardMedia, Chip, Skeleton, Tooltip, Typography, Avatar } from '@mui/material'
import type { PollResult, PuzzleResult, StoryInfo, UserPollStatus, UserPuzzleStatus, UserStoryStatus } from '../types'
import { FindTrumanI18nFunction, FindTrumanPostType } from '../types'
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
        c: {
            color: 'rgba(255,255,255,.9)',
            fontWeight: 500,
            fontSize: 14,
            width: 24,
            height: 24,
            backgroundImage: 'linear-gradient( 135deg, #FDD819 10%, #E80505 100%)',
            cursor: 'pointer',
        },
        n: {
            color: 'rgba(255,255,255,.9)',
            fontWeight: 500,
            fontSize: 14,
            width: 24,
            height: 24,
            backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
            cursor: 'pointer',
        },
    }
})

interface FindTrumanProps {
    postType: FindTrumanPostType
    clueId: string
    storyInfo?: StoryInfo
    userStoryStatus?: UserStoryStatus
    userPuzzleStatus?: UserPuzzleStatus
    userPollStatus?: UserPollStatus
    puzzleResult?: PuzzleResult
    pollResult?: PollResult
    onSubmit: (choice: number) => Promise<boolean>
}

function getPostTypeTitle(t: FindTrumanI18nFunction, postType: FindTrumanPostType) {
    switch (postType) {
        case FindTrumanPostType.Poll:
            return t('plugin_find_truman_status_poll')
        case FindTrumanPostType.Puzzle:
            return t('plugin_find_truman_status_puzzle')
        case FindTrumanPostType.PuzzleResult:
            return t('plugin_find_truman_status_puzzle_result')
        case FindTrumanPostType.PollResult:
            return t('plugin_find_truman_status_poll_result')
        case FindTrumanPostType.Status:
            return t('plugin_find_truman_status_result')
        default:
            return ''
    }
}

export function FindTruman(props: FindTrumanProps) {
    const { classes } = useStyles()
    const { address, t } = useContext(FindTrumanContext)
    const {
        postType,
        clueId,
        storyInfo,
        userStoryStatus,
        userPuzzleStatus,
        userPollStatus,
        puzzleResult,
        pollResult,
        onSubmit,
    } = props

    const [loadImg, setLoadImg] = useState<boolean>(true)

    const isCritical = userPuzzleStatus?.critical || userPollStatus?.critical
    const isNoncritical =
        (userPuzzleStatus && !userPuzzleStatus.critical) || (userPollStatus && !userPollStatus.critical)

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
                            visibility: loadImg ? 'hidden' : 'unset',
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
                                    <Box display="flex" columnGap={1}>
                                        <Tooltip
                                            PopperProps={{
                                                disablePortal: true,
                                            }}
                                            arrow
                                            placement="top"
                                            title={
                                                isCritical
                                                    ? t('plugin_find_truman_status_critical')
                                                    : isNoncritical
                                                    ? t('plugin_find_truman_status_noncritical')
                                                    : ''
                                            }>
                                            <Box>
                                                {isCritical && <Avatar className={classes.c}>C</Avatar>}
                                                {isNoncritical && <Avatar className={classes.n}>N</Avatar>}
                                            </Box>
                                        </Tooltip>
                                        <Chip color="primary" size="small" label={getPostTypeTitle(t, postType)} />
                                    </Box>
                                </Box>
                            )
                        }
                    />
                    {postType === FindTrumanPostType.Status && userStoryStatus && (
                        <StageCard userStoryStatus={userStoryStatus} />
                    )}
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
                <EncryptionCard clueId={clueId} />
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
