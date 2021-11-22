import { Box, CardMedia, Typography, Card, CardContent, CardActions, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import type { PuzzleCondition } from '../types'

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
    const { t } = useI18N()

    const renderNftCard = (title: string, img: string, url: string, count: number) => {
        return (
            <Card className={classes.card} variant="outlined">
                <CardMedia component={'img'} image={img} />
                <CardContent className={classes.content}>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant={'body2'} color={'textSecondary'}>
                        {t(count > 1 ? 'plugin_allblue_buy_nft_tip' : 'plugin_allblue_buy_nfts_tip', { count })}
                    </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }} className={classes.content}>
                    <Button
                        component={'a'}
                        href={url}
                        target={'_blank'}
                        size={conditions.length > 1 ? 'small' : 'medium'}>
                        {t('plugin_allblue_buy')}
                    </Button>
                </CardActions>
            </Card>
        )
    }

    return (
        <Box sx={{ marginTop: 1 }}>
            {conditions.map((condition) =>
                renderNftCard(condition.name, condition.img, condition.url, condition.minAmount),
            )}
        </Box>
    )
}
