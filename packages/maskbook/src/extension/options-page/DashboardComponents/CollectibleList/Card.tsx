import Tilt from 'react-tilt'
import { Card, createStyles, Link, makeStyles } from '@material-ui/core'
import { Image } from '../../../../components/shared/Image'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
        },
    }),
)

export interface CollectibleCardProps {
    url: string
    link: string
    canViewOnEtherscan?: boolean
}

export function CollectibleCard(props: CollectibleCardProps) {
    const classes = useStyles(props)

    return (
        <Link target="_blank" rel="noopener noreferrer" href={props.link}>
            <Tilt options={{ scale: 1, max: 30, glare: true, 'max-glare': 1, speed: 1000 }}>
                <Card
                    className={classes.root}
                    style={{
                        width: 160,
                        height: 220,
                    }}>
                    <Image component="img" width={160} height={220} src={props.url} />
                </Card>
            </Tilt>
        </Link>
    )
}
