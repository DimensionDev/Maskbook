import { Person, Group } from '../database'
import { PersonIdentifier, GroupIdentifier, GroupType } from '../database/type'
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

export const demoGroup: Group[] = [
    {
        groupName: 'Group A',
        identifier: new GroupIdentifier('localhost', '12345', GroupType.real),
        members: demoPeople.map(x => x.identifier),
    },
    {
        groupName: 'Group B',
        identifier: new GroupIdentifier('localhost', '2345', GroupType.virtual, demoPeople[0].identifier.userId),
        members: demoPeople.map(x => x.identifier).slice(1),
    },
    {
        groupName: 'Group C',
        identifier: new GroupIdentifier('localhost', '3456', GroupType.real),
        members: demoPeople.map(x => x.identifier).slice(2),
    },
    {
        groupName: 'Group D',
        identifier: new GroupIdentifier('localhost', '4567', GroupType.real),
        members: demoPeople.map(x => x.identifier).slice(3),
    },
    {
        groupName: 'Group E',
        identifier: new GroupIdentifier('localhost', '4567', GroupType.real),
        members: [],
    },
]
