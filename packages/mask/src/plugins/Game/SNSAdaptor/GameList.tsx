import { Button } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useGameList } from '../hook'

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
    onPlay: (gameUrl: string) => void
}

const GameList = (props: Props) => {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const gameList = useGameList()

    return (
        <div className={classes.walletBar}>
            <h2 className={classes.title}>{t('plugin_game_list_title')}</h2>
            <ul className={classes.gameList}>
                {gameList
                    ? gameList.map((game: any) => (
                          <li className={classes.gameBar} key={game.id}>
                              <img className={classes.logo} src={game.image} alt="" />
                              <div className={classes.info}>
                                  <div className={classes.infoTitle}>{game.name}</div>
                                  <div className={classes.introduction}>{game.description}</div>
                                  <div className={classes.rank}>
                                      {t('plugin_game_list_rank')} {game.rank}
                                  </div>
                              </div>
                              <Button className={classes.playBtn} onClick={() => props.onPlay(game.url)}>
                                  {t('plugin_game_list_play')}
                              </Button>
                          </li>
                      ))
                    : null}
            </ul>
        </div>
    )
}

export default GameList
