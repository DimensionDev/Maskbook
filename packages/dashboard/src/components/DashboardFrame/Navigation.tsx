import { List, ListItem as _ListItem, Box, ListItemText, ListItemIcon, Collapse, styled } from '@material-ui/core'
import { Masks, AccountBalanceWallet, ExpandLess, ExpandMore, Settings } from '@material-ui/icons'
import { useState } from 'react'

const ListItem = styled(_ListItem)(({ theme }) => ({
    '&.Mui-selected': {
        backgroundColor: 'transparent',
        borderRight: '4px solid ' + (theme.palette.mode === 'light' ? theme.palette.action.selected : 'white'),
        // Or?
        // borderRight: '4px solid ' + theme.palette.action.selected,
    },
}))
const NestedListItem = styled(_ListItem)(({ theme }) => ({
    paddingLeft: theme.spacing(9),
}))
export function Navigation() {
    const [expanded, setExpanded] = useState(false)
    return (
        <List>
            <_ListItem component={Box} sx={{ justifyContent: 'center' }}>
                <img height={40} alt="Mask Logo" src="https://mask.io/assets/icons/logo.svg" />
            </_ListItem>
            <Box sx={{ height: 40 }} />
            <ListItem button>
                <ListItemIcon>
                    <Masks />
                </ListItemIcon>
                <ListItemText primary="Personas" />
            </ListItem>
            <ListItem button selected onClick={() => setExpanded((e) => !e)}>
                <ListItemIcon>
                    <AccountBalanceWallet />
                </ListItemIcon>
                <ListItemText>Wallets</ListItemText>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={expanded}>
                <List disablePadding>
                    <NestedListItem button>
                        <ListItemText primary="Transfer" />
                    </NestedListItem>
                    <NestedListItem button>
                        <ListItemText primary="Swap" />
                    </NestedListItem>
                    <NestedListItem button>
                        <ListItemText primary="Red packet" />
                    </NestedListItem>
                    <NestedListItem button>
                        <ListItemText primary="Sell" />
                    </NestedListItem>
                    <NestedListItem button>
                        <ListItemText primary="History" />
                    </NestedListItem>
                </List>
            </Collapse>
            <ListItem button>
                <ListItemIcon>
                    <Settings />
                </ListItemIcon>
                <ListItemText primary="Settings" />
            </ListItem>
        </List>
    )
}
