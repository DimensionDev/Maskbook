import { Sport, SportType } from '../types'
import Teams from './teams.json'
import Fighters from './fighters.json'

export default {
    [SportType.NFL]: {
        sportId: '2',
        name: 'NFL',
        categories: ['Sports', 'American Football', 'NFL'],
        teams: Teams,
    },
    [SportType.MLB]: {
        sportId: '3',
        name: 'MLB',
        categories: ['Sports', 'Baseball', 'MLB'],
        teams: Teams,
    },
    [SportType.NBA]: {
        sportId: '4',
        name: 'NBA',
        categories: ['Sports', 'Basketball', 'NBA'],
        teams: Teams,
    },
    [SportType.NHL]: {
        sportId: '6',
        name: 'NHL',
        categories: ['Sports', 'Hockey', 'NHL'],
        teams: Teams,
    },
    [SportType.MMA]: {
        sportId: '7',
        name: 'UFC/MMA',
        categories: ['Sports', 'MMA', 'UFC'],
        teams: Fighters,
    },
} as { [key in SportType]: Sport }
