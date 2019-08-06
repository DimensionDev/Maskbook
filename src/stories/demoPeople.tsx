import { Person } from '../database'
import { PersonIdentifier } from '../database/type'
export const demoPeople: Person[] = [
    {
        fingerprint: 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521',
        avatar: 'https://avatars3.githubusercontent.com/u/5390719?s=460&v=4',
        nickname: '雨宮響也',
        identifier: new PersonIdentifier('facebook.com', 'test'),
        groups: [],
    },
    {
        fingerprint: 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521'
            .split('')
            .reverse()
            .join(''),
        avatar: 'https://avatars1.githubusercontent.com/u/3343358?s=460&v=4',
        nickname: '赫胥黎',
        identifier: new PersonIdentifier('twitter.com', 'test2'),
        groups: [],
    },
    {
        fingerprint: 'a2f7643cd1aed446ad88f3c8ba13843dfa2f321d',
        nickname: '小樱茉莉',
        identifier: new PersonIdentifier('mastodon@example.org', 'test3'),
        groups: [],
    },
    {
        fingerprint: 'a2f7643cd1aed446ad88f3c8ba13843dfa2f321d',
        nickname: '温斯顿·史密斯',
        identifier: new PersonIdentifier('gnu-social@example.org', 'test4'),
        groups: [],
    },
]
