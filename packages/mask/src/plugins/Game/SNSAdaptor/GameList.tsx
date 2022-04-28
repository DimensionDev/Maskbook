import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Button } from '@mui/material'
import { IconGame } from '../constants'

const useStyles = makeStyles()(() => ({
    walletBar: {},
    title: {
        fontSize: '20px',
        fontWeight: '500',
        padding: 0,
    },
    gameList: {
        padding: 0,
    },
    gameBar: {
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '20px',
    },
    logo: {
        flex: 'none',
        width: '90px',
        height: '90px',
        borderRadius: '8px',
        backgroundColor: '#f7f7f7',
    },
    info: {
        flex: 'auto',
        margin: '0 20px',
    },
    infoTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#000',
    },
    introduction: {
        fontSize: '14px',
        color: '#888',
        marginTop: '10px',
    },
    rank: {
        backgroundColor: '#FAE4D5',
        color: '#EB7A5F',
        padding: '2px 8px',
        marginTop: '10px',
        borderRadius: '100px',
        display: 'inline-block',
        fontSize: '12px',
    },
    playBtn: {
        backgroundColor: '#E8F0FD',
        color: '#1B68F5',
        flex: 'none',
        alignSelf: 'center',
        minWidth: '80px',
        '&:hover': {
            backgroundColor: '#f7f7f7',
        },
    },
}))

interface Props {
    onPlay: () => void
}

const GameList = (props: Props) => {
    const classes = useStylesExtends(useStyles(), {})

    return (
        <div className={classes.walletBar}>
            <h2 className={classes.title}>GameList</h2>
            <ul className={classes.gameList}>
                <li className={classes.gameBar}>
                    <img className={classes.logo} src={IconGame} alt="game logo" />
                    <div className={classes.info}>
                        <div className={classes.infoTitle}>Skiing Adcenture</div>
                        <div className={classes.introduction}>
                            Fead the starving little penguins - decompression game
                        </div>
                        <div className={classes.rank}>Rank 112</div>
                    </div>
                    <Button className={classes.playBtn} onClick={props.onPlay}>
                        Play
                    </Button>
                </li>
            </ul>
        </div>
    )
}

export default GameList
