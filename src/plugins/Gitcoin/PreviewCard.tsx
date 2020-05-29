import React from 'react'
import { makeStyles, createStyles, Theme, Typography, SnackbarContent, Button, Box } from '@material-ui/core'
const border = '1.5px solid rgb(0, 154, 87)'
interface PreviewCardProps {
    title: string
    image: React.ReactNode
    line1: string
    line2: string
    line3: string
    line4: string
    hasNoPermission?: boolean
    requestPermission(): void
    onRequestGrant(): void
    loading?: boolean
    address?: string
    originalURL: string
}
export function PreviewCard(props: PreviewCardProps) {
    const classes = useStyles()
    if (props.hasNoPermission) {
        return (
            <SnackbarContent
                message="This post links to the Gitcoin. To preview it or donate this Gitcoin grant, Maskbook needs permission to Gitcoin.co"
                action={
                    <Button
                        onClick={props.requestPermission}
                        children="Allow access to gitcoin.co"
                        color="secondary"
                        size="small"
                    />
                }
            />
        )
    }
    return (
        <div>
            <main className={classes.root}>
                <div className={classes.title}>
                    <Typography variant="h5">{props.title}</Typography>
                </div>
                <div className={classes.infoArea}>
                    <Typography className={classes.expectedArea} variant="h6">
                        {props.line1}
                    </Typography>
                    <Typography className={classes.expectedArea} variant="body2">
                        {props.line2}
                    </Typography>
                    <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                        {props.line3}
                    </Typography>
                    <Typography variant="body2">{props.line4}</Typography>
                </div>
                <aside className={classes.image}>{props.image}</aside>
            </main>
            <Box paddingTop={2} textAlign="center">
                <Button
                    // If failed to fetch the contract address, fallback
                    onClick={() => (props.address ? props.onRequestGrant() : window.open(props.originalURL))}
                    variant="contained"
                    color="primary">
                    Fund this grant
                </Button>
            </Box>
        </div>
    )
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            borderRadius: 12,
            border: border,
            background: 'white',
            minWidth: 400,
            width: '100%',
            height: 200,
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gridTemplateAreas: `
                "title image"
                "info  image"
            `,
            overflow: 'hidden',
        },
        image: {
            gridArea: 'image',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: border,
        },
        title: {
            padding: theme.spacing(2),
            // https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-line-clamp#Browser_compatibility
            // all browsers support this
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            '& > *': { overflow: 'hidden' },
        },
        infoArea: {
            background: 'rgb(232, 255, 246)',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gridAutoFlow: 'column',
            alignItems: 'start',
            padding: theme.spacing(2),
            '& > *:nth-child(odd)': {
                alignSelf: 'end',
            } as React.CSSProperties,
            '& > *': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            } as React.CSSProperties,
        },
        expectedArea: {
            color: 'rgb(0, 154, 87)',
        },
    }),
)
