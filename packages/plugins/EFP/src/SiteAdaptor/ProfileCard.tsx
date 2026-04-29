import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/react/macro'
import { makeStyles } from '@masknet/theme'
import { Box, Link, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { EFP_API_URL, EFP_FALLBACK_IMAGE_URL } from '../constants.js'
import type { EFPProfileLink } from '../helpers/url.js'

interface EFPProfileResponse {
    address?: string
    ens?: {
        name?: string | null
        records?: Record<string, string | undefined> | null
    } | null
    followers_count?: number | string
    following_count?: number | string
    primary_list?: string | null
}

interface ProfileCardProps {
    profileLink: EFPProfileLink
}

interface EFPProfileState {
    data: EFPProfileResponse | null
    loading: boolean
}

type EFPProfileAction =
    | { type: 'loading' }
    | { type: 'success'; data: EFPProfileResponse | null }
    | { type: 'error' }

const formatter = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
})

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1.5),
        paddingTop: 0,
    },
    card: {
        overflow: 'hidden',
        borderRadius: 8,
        border: `1px solid ${theme.palette.maskColor.line}`,
        color: theme.palette.maskColor.main,
        background: theme.palette.maskColor.bottom,
    },
    image: {
        display: 'block',
        width: '100%',
        aspectRatio: '1.91 / 1',
        objectFit: 'cover',
        background: theme.palette.maskColor.bg,
    },
    imageFallback: {
        display: 'flex',
        width: '100%',
        aspectRatio: '1.91 / 1',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f1f3fe 0%, #dff2fb 45%, #ecfffd 100%)',
        color: '#333333',
    },
    body: {
        padding: theme.spacing(1.5),
        gap: theme.spacing(1),
    },
    eyebrow: {
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        lineHeight: 1,
    },
    title: {
        fontWeight: 700,
        wordBreak: 'break-word',
        lineHeight: 1.25,
    },
    description: {
        color: theme.palette.maskColor.second,
        display: '-webkit-box',
        overflow: 'hidden',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
    },
    metrics: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(1),
    },
    metric: {
        minWidth: 86,
        borderRadius: 8,
        padding: theme.spacing(0.75, 1),
        background: theme.palette.maskColor.bg,
    },
    metricValue: {
        fontWeight: 700,
        lineHeight: 1.2,
    },
    metricLabel: {
        color: theme.palette.maskColor.second,
        lineHeight: 1.2,
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing(1),
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontWeight: 700,
        textDecoration: 'none',
    },
}))

export function ProfileCard({ profileLink }: ProfileCardProps) {
    const { classes } = useStyles()
    const { data, loading } = useEFPProfile(profileLink)
    const displayName = useMemo(() => getDisplayName(profileLink, data), [profileLink, data])
    const description = data?.ens?.records?.description
    const primaryList = data?.primary_list

    return (
        <Stack className={classes.root}>
            <Box className={classes.card}>
                <ProfileImage key={profileLink.imageUrl} profileLink={profileLink} />
                <Stack className={classes.body}>
                    <Typography className={classes.eyebrow} variant="caption">
                        {profileLink.topEight ?
                            <Trans>EFP Top 8</Trans>
                        :   <Trans>Ethereum Follow Protocol</Trans>}
                    </Typography>
                    <Typography className={classes.title} variant="h6">
                        {displayName}
                    </Typography>
                    {description ?
                        <Typography className={classes.description} variant="body2">
                            {description}
                        </Typography>
                    :   null}
                    <Box className={classes.metrics}>
                        <Metric
                            label={<Trans>Followers</Trans>}
                            value={loading ? '--' : formatCount(data?.followers_count)}
                        />
                        <Metric
                            label={<Trans>Following</Trans>}
                            value={loading ? '--' : formatCount(data?.following_count)}
                        />
                        {primaryList ?
                            <Metric label={<Trans>Primary List</Trans>} value={`#${primaryList}`} />
                        : profileLink.type === 'list' ?
                            <Metric label={<Trans>List</Trans>} value={`#${profileLink.user}`} />
                        :   null}
                    </Box>
                    <Box className={classes.footer}>
                        <Typography variant="caption" color="textSecondary">
                            {profileLink.type === 'list' ?
                                <Trans>EFP list</Trans>
                            :   <Trans>EFP profile</Trans>}
                        </Typography>
                        <Link
                            className={classes.link}
                            href={profileLink.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Trans>View on EFP</Trans>
                            <Icons.LinkOut size={14} />
                        </Link>
                    </Box>
                </Stack>
            </Box>
        </Stack>
    )
}

function ProfileImage({ profileLink }: ProfileCardProps) {
    const { classes } = useStyles()
    const [imageUrl, setImageUrl] = useState(profileLink.imageUrl)
    const [failed, setFailed] = useState(false)

    if (failed) {
        return (
            <Box className={classes.imageFallback}>
                <Icons.Web3Profile size={64} />
            </Box>
        )
    }

    return (
        <img
            className={classes.image}
            src={imageUrl}
            alt=""
            onError={() => {
                if (imageUrl === EFP_FALLBACK_IMAGE_URL) {
                    setFailed(true)
                    return
                }
                setImageUrl(EFP_FALLBACK_IMAGE_URL)
            }}
        />
    )
}

function Metric({ label, value }: { label: ReactNode; value: string }) {
    const { classes } = useStyles()
    return (
        <Box className={classes.metric}>
            <Typography className={classes.metricValue} variant="body2">
                {value}
            </Typography>
            <Typography className={classes.metricLabel} variant="caption">
                {label}
            </Typography>
        </Box>
    )
}

function useEFPProfile(profileLink: EFPProfileLink) {
    const [state, dispatch] = useReducer(reduceEFPProfileState, {
        data: null,
        loading: true,
    })

    useEffect(() => {
        let cancelled = false
        dispatch({ type: 'loading' })

        fetchEFPProfile(profileLink.apiPath)
            .then((data) => {
                if (cancelled) return
                dispatch({ type: 'success', data: isProfileResponse(data) ? data : null })
            })
            .catch(() => {
                if (cancelled) return
                dispatch({ type: 'error' })
            })

        return () => {
            cancelled = true
        }
    }, [profileLink.apiPath])

    return state
}

function reduceEFPProfileState(_: EFPProfileState, action: EFPProfileAction): EFPProfileState {
    if (action.type === 'loading') return { data: null, loading: true }
    if (action.type === 'success') return { data: action.data, loading: false }
    return { data: null, loading: false }
}

async function fetchEFPProfile(apiPath: string) {
    const response = await fetch(`${EFP_API_URL}${apiPath}`, {
        headers: {
            Accept: 'application/json',
        },
    })
    if (!response.ok) throw new Error('Failed to fetch EFP profile')
    return response.json() as Promise<EFPProfileResponse>
}

function isProfileResponse(value: EFPProfileResponse | null): value is EFPProfileResponse {
    return !!value && (typeof value.address === 'string' || typeof value.primary_list === 'string')
}

function getDisplayName(profileLink: EFPProfileLink, data: EFPProfileResponse | null) {
    const ensName = data?.ens?.name
    if (ensName) return ensName
    if (profileLink.type === 'list') return `List #${profileLink.user}`
    return truncateAddress(profileLink.user)
}

function truncateAddress(value: string) {
    if (!/^0x[\dA-Fa-f]{40}$/u.test(value)) return value
    return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function formatCount(value: string | number | undefined) {
    const count = Number(value)
    if (!Number.isFinite(count)) return '--'
    return formatter.format(count)
}
