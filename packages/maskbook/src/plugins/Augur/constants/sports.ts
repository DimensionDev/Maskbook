import type { Sport } from '../types'
import Teams from './teams.json'
import Fighters from './fighters.json'

export default {
    '2': {
        sportId: '2',
        name: 'NFL',
        categories: ['Sports', 'American Football', 'NFL'],
        teams: Teams,
    },
    '3': {
        sportId: '3',
        name: 'MLB',
        categories: ['Sports', 'Baseball', 'MLB'],
        teams: Teams,
    },
    '4': {
        sportId: '4',
        name: 'NBA',
        categories: ['Sports', 'Basketball', 'NBA'],
        teams: Teams,
    },
    '6': {
        sportId: '6',
        name: 'NHL',
        categories: ['Sports', 'Hockey', 'NHL'],
        teams: Teams,
    },
    '7': {
        sportId: '7',
        name: 'UFC/MMA',
        categories: ['Sports', 'MMA', 'UFC'],
        teams: Fighters,
    },
} as { [key: string]: Sport }
