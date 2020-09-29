import React from 'react'
import { makeStyles, createStyles, Theme, Typography, Button, Box, Paper } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'

const border = '1.5px solid rgb(0, 154, 87)'
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            borderRadius: 12,
            border: border,
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
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                gridTemplateColumns: '1fr',
                gridTemplateRows: '1fr 1fr',
                gridTemplateAreas: `
                "title"
                "info"
            `,
            },
        },
        footer: {
            paddingTop: theme.spacing(2),
            display: 'flex',
            justifyContent: 'center',
        },
        aside: {
            gridArea: 'image',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: border,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                display: 'none',
            },
        },
        image: {
            maxWidth: '90%',
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
            background: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgb(232, 255, 246)',
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
        primaryArea: {
            color: 'rgb(0, 154, 87)',
        },
        secondaryArea: {
            color: theme.palette.type === 'dark' ? '#BDBDBD' : theme.palette.common.black,
        },
    }),
)

interface PreviewCardProps {
    logo?: string
    title: string
    line1: string
    line2: string
    line3: string
    line4: string
    address?: string
    originalURL?: string
    onRequestGrant(): void
}
export function PreviewCard(props: PreviewCardProps) {
    const { t } = useI18N()
    const classes = useStyles()
    return (
        <>
            <Paper className={classes.container}>
                <div className={classes.title}>
                    <Typography variant="h5">{props.title}</Typography>
                </div>
                <div className={classes.infoArea}>
                    <Typography className={classes.primaryArea} variant="h6">
                        {props.line1}
                    </Typography>
                    <Typography className={classes.primaryArea} variant="body2">
                        {props.line2}
                    </Typography>
                    <Typography className={classes.secondaryArea} variant="body1" style={{ fontWeight: 'bold' }}>
                        {props.line3}
                    </Typography>
                    <Typography className={classes.secondaryArea} variant="body2">
                        {props.line4}
                    </Typography>
                </div>
                <aside className={classes.aside}>
                    {props.logo ? <img className={classes.image} src={props.logo} /> : null}
                </aside>
            </Paper>
            <Box className={classes.footer}>
                <Button
                    // If failed to fetch the contract address, fallback
                    onClick={() => (props.address ? props.onRequestGrant() : window.open(props.originalURL))}
                    variant="contained">
                    {t('plugin_gitcoin_preview_card_fund')}
                </Button>
            </Box>
        </>
    )
}
