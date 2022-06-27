import { Button, Card, CardActions, CardContent, CardMedia, Grid, Theme, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { PuzzleCondition } from '../types'
import { useContext } from 'react'
import { FindTrumanContext } from '../context'
import type { SxProps } from '@mui/system'

const useStyles = makeStyles()((theme) => {
    return {
        card: {
            borderRadius: '6px',
            ':not(:last-child)': {
                marginBottom: '8px',
            },
            display: 'flex',
            flexDirection: 'column',
        },
        content: {
            flex: 1,
        },
        title: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            textTransform: 'uppercase',
        },
    }
})

interface NoNftCardProps {
    conditions: PuzzleCondition[]
    sx?: SxProps<Theme>
}
export default function NoNftCard(props: NoNftCardProps) {
    const { conditions, sx } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)

    const renderNftCard = (title: string, img: string, url: string, count: number, address: string) => {
        return (
            <Grid key={title} item xs={6}>
                <Card key={address} className={classes.card} variant="outlined">
                    <CardMedia component="img" image={img} />
                    <CardContent className={classes.content}>
                        <Typography gutterBottom variant="h5" component="div">
                            {title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {t('plugin_find_truman_buy_nft_tip', {
                                count,
                                name: title,
                            })}
                        </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <Button
                            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                e.stopPropagation()
                            }}
                            component="a"
                            href={url}
                            target="_blank"
                            size="small">
                            {t('plugin_find_truman_buy')}
                        </Button>
                    </CardActions>
                </Card>
            </Grid>
        )
    }

    return (
        <Grid container spacing={2} justifyContent="space-around" sx={{ ...(sx || {}) }}>
            {conditions.map((condition) =>
                renderNftCard(condition.name, condition.img, condition.url, condition.minAmount, condition.address),
            )}
        </Grid>
    )
}
