import { Box, CardMedia, Typography, Card, CardContent, CardActions, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { PuzzleCondition } from '../types'
import { useContext } from 'react'
import { FindTrumanContext } from '../context'

const useStyles = makeStyles()((theme) => {
    return {
        card: {
            borderRadius: '6px',
            ':not(:last-child)': {
                marginBottom: '8px',
            },
        },
        content: {},
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
}
export default function NoNftCard(props: NoNftCardProps) {
    const { conditions } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)

    const renderNftCard = (title: string, img: string, url: string, count: number, address: string) => {
        return (
            <Card key={address} className={classes.card} variant="outlined">
                <CardMedia component="img" image={img} />
                <CardContent className={classes.content}>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {t(count > 1 ? 'plugin_find_truman_buy_nfts_tip' : 'plugin_find_truman_buy_nft_tip', { count })}
                    </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }} className={classes.content}>
                    <Button component="a" href={url} variant="contained" target="_blank" size="small">
                        {t('plugin_find_truman_buy')}
                    </Button>
                </CardActions>
            </Card>
        )
    }

    return (
        <Box sx={{ marginTop: 1 }}>
            {conditions.map((condition) =>
                renderNftCard(condition.name, condition.img, condition.url, condition.minAmount, condition.address),
            )}
        </Box>
    )
}
