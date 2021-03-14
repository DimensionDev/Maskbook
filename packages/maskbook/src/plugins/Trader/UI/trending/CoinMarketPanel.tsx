import { makeStyles, createStyles } from '@material-ui/core'
import { DataProvider, Trending } from '../../types'
import { CoinMarketTable } from './CoinMarketTable'
import { CoinMetadataTable } from './CoinMetadataTable'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2),
        },
    }),
)

export interface CoinMarketPanelProps {
    trending: Trending
    dataProvider: DataProvider
}

export function CoinMarketPanel(props: CoinMarketPanelProps) {
    const { dataProvider, trending } = props
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <CoinMetadataTable dataProvider={dataProvider} trending={trending} />
            <br />
            {dataProvider !== DataProvider.UNISWAP_INFO ? (
                <CoinMarketTable dataProvider={dataProvider} trending={trending} />
            ) : null}
        </div>
    )
}
