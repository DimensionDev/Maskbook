import { useEffect, useState } from 'react'
import { Button, List, Typography } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../locales/index.js'
import { useGameList } from '../hook/index.js'
import type { GameInfo } from '../types.js'
import classNames from 'classnames'

const useStyles = makeStyles()(() => ({
    title: {
        fontSize: '20px',
        fontWeight: '500',
        paddingBottom: '8px',
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
    },
    info: {
        flex: 'auto',
        margin: '0 4px 0 20px',
        maxWidth: 'calc(100% - 214px)',
    },
    infoTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
    },
    introduction: {
        fontSize: '14px',
        color: '#888',
        marginTop: '10px',
        textOverflow: 'ellipsis',
        '-webkit-line-clamp': '2',
        '-webkit-box-orient': 'vertical',
        display: '-webkit-box',
        maxHeight: '40px',
        lineHeight: '20px',
        overflow: 'hidden',
        flex: 'auto',
    },
    isOpen: {
        maxHeight: '200px',
        '-webkit-line-clamp': 'inherit',
        '-webkit-box-orient': 'inherit',
        textOverflow: 'inherit',
    },
    isTurn: {
        transform: 'rotate(180deg)',
    },
    introductionRow: {
        display: 'flex',
        alignItems: 'center',
    },

    arrowBtn: {
        flex: 'none',
        cursor: 'pointer',
        padding: '2px 0',
        transition: '200ms',
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
        flex: 'none',
        alignSelf: 'center',
        minWidth: '80px',
        marginLeft: '4px',
    },
}))

interface Props {
    onPlay: (game: GameInfo) => void
}

const GameList = (props: Props) => {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const gameList = useGameList()
    const [descTypes, setDescTypes] = useState<boolean[]>([])
    useEffect(() => {
        if (!gameList?.length) {
            setDescTypes([])
        } else {
            setDescTypes(gameList.map(() => false))
        }
    }, [gameList?.length])

    const toggleDescType = (index: number) => {
        descTypes[index] = !descTypes[index]
        setDescTypes([...descTypes])
    }

    return (
        <>
            <List className={classes.walletBar}>
                <Typography className={classes.title}>{t.game_list_title()}</Typography>
                <ul className={classes.gameList}>
                    {gameList
                        ? gameList.map((game, index: number) => (
                              <li className={classes.gameBar} key={game.id}>
                                  <img className={classes.logo} src={game.image} alt="" />
                                  <div className={classes.info}>
                                      <Typography className={classes.infoTitle}>{game.name}</Typography>
                                      <div className={classes.introductionRow}>
                                          <Typography
                                              className={classNames(classes.introduction, {
                                                  [classes.isOpen]: descTypes[index],
                                              })}>
                                              {game.description}
                                          </Typography>
                                          <ArrowDropDownIcon
                                              className={classNames(classes.arrowBtn, {
                                                  [classes.isTurn]: descTypes[index],
                                              })}
                                              onClick={() => toggleDescType(index)}
                                          />
                                      </div>
                                      <Typography className={classes.rank}>
                                          {t.game_list_rank()} {game.rank}
                                      </Typography>
                                  </div>
                                  <Button
                                      variant="roundedContained"
                                      className={classes.playBtn}
                                      onClick={() => props.onPlay(game)}>
                                      {t.game_list_play()}
                                  </Button>
                              </li>
                          ))
                        : null}
                </ul>
            </List>
        </>
    )
}

export default GameList
