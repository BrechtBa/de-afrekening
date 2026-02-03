import { useEffect, useState } from "react";
import type { LedgerName } from "../domain";
import { useCases } from "../factory";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, List, ListItem, ListItemAvatar, ListItemText, Paper, TextField } from "@mui/material";
import { NavLink, useNavigate } from "react-router";
import { Add, LocalBar } from "@mui/icons-material";
import { stringToColor, type NewLedger } from "../useCases";



function LedgerListItem({ledger}: {ledger: LedgerName}) {

  return (
    <NavLink to={`/${ledger.key}`}>
      <Paper style={{marginBottom: "0.5em"}}>
        <ListItem>
          <ListItemAvatar>
            <Avatar sx={{bgcolor: stringToColor(ledger.name)}}>
              <LocalBar />
            </Avatar>
          </ListItemAvatar>

          <ListItemText primary={ledger.name} secondary=""/>
        </ListItem>
      </Paper>
    </NavLink>
  );
}


function AddLedger({addLedger}: {addLedger: (ledger: NewLedger) => void}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLedger, setNewLedger] = useState<NewLedger>({name: ""});

  const handleSave = () => {
    addLedger(newLedger);
    setNewLedger({name: ""});
    setDialogOpen(false);
  }

  return (
    <div>
      <div style={{display: "flex", justifyContent:"flex-end"}}>
        <Fab color="primary" aria-label="add" onClick={() => setDialogOpen(true)}>
          <Add />
        </Fab>
      </div>

      <Dialog open={dialogOpen} onClose={()=> setDialogOpen(false)}>
        <DialogTitle>
          Rekening toevoegen
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
          </DialogContentText>

          <TextField label="Name" value={newLedger.name} onChange={e => setNewLedger(n => ({...n, name: e.target.value}))} />
        </DialogContent>

        <DialogActions>
          <Button onClick={()=> setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} autoFocus>Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


export function ListLedgers() {
  let navigate = useNavigate();

  const [ledgerNames, setLedgerNames] = useState<Array<LedgerName>>([]);

  useEffect(() => {
    setLedgerNames(useCases.readLedgerNames());
  }, []);


  return (
    <div>
      <h1>Rekeningen</h1>
      <List>
        {ledgerNames.map(ledger =>(
          <LedgerListItem key={ledger.key} ledger={ledger} />
        ))}
      </List>

      <AddLedger addLedger={newLedger => navigate(`/${useCases.createNewLedger(newLedger).key}`)}/>
      
    </div>
  );

}