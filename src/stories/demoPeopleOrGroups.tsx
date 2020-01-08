import { Profile, Group, Persona } from '../database'
import { ProfileIdentifier, GroupIdentifier, ECKeyIdentifier } from '../database/type'
import { IdentifierMap } from '../database/IdentifierMap'

const emptyProfile = {
    createdAt: new Date(),
    updatedAt: new Date(),
    linkedPersona: {
        createdAt: new Date(),
        updatedAt: new Date(),
        hasPrivateKey: false,
        identifier: new ECKeyIdentifier('secp256k1', Math.random().toString()),
        fingerprint: Math.random()
            .toString(26)
            .slice(2)
            .toUpperCase(),
        linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier) as Persona['linkedProfiles'],
    },
}

export const demoPeople: Profile[] = [
    {
        ...emptyProfile,
        avatar: 'https://avatars3.githubusercontent.com/u/5390719?s=460&v=4',
        nickname: '雨宮響也',
        identifier: new ProfileIdentifier('facebook.com', 'test'),
    },
    {
        ...emptyProfile,
        avatar: 'https://avatars1.githubusercontent.com/u/3343358?s=460&v=4',
        nickname: '赫胥黎',
        identifier: new ProfileIdentifier('twitter.com', 'test2'),
    },
    {
        ...emptyProfile,
        nickname: '小樱茉莉',
        identifier: new ProfileIdentifier('mastodon@example.org', 'test3'),
    },
    {
        ...emptyProfile,
        nickname: '温斯顿·史密斯',
        identifier: new ProfileIdentifier('gnu-social@example.org', 'test4'),
    },
]

export const demoGroup: Group[] = [
    {
        groupName: 'Group A',
        identifier: new GroupIdentifier('localhost', null, '12345'),
        members: demoPeople.map(x => x.identifier),
    },
    {
        groupName: 'Group B',
        identifier: new GroupIdentifier('localhost', demoPeople[0].identifier.userId, '2345'),
        members: demoPeople.map(x => x.identifier).slice(1),
    },
    {
        groupName: 'Group C',
        identifier: new GroupIdentifier('localhost', null, '3456'),
        members: demoPeople.map(x => x.identifier).slice(2),
    },
    {
        groupName: 'Group D',
        identifier: new GroupIdentifier('localhost', null, '4567'),
        members: demoPeople.map(x => x.identifier).slice(3),
    },
    {
        groupName: 'Group E',
        identifier: new GroupIdentifier('localhost', null, '8493'),
        members: [],
    },
]
