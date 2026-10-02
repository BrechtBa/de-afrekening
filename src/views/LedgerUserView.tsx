import { useEffect, useState } from "react";

import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItemAvatar, Paper } from "@mui/material";
import { ArrowBack, Delete, Edit } from "@mui/icons-material";


import type { Ledger, Record } from "../domain";
import { NavLink, useNavigate, useParams } from "react-router";
import { useCases } from "../factory";
import { formatDate, formatTime, type NewUser } from "../useCases";

import { ListLedgers } from "./ListLedgersView";
import { EditLedger } from "./LedgerView";
import { EditUserDialog } from "../components/EditUserDialog";





function LedgerUserRecord({record, deleteRecord}: {record: Record, deleteRecord: () => void}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteRecord();
    setDialogOpen(false);
  }

  return (
    <Paper style={{marginBottom: "0.5em", padding: "0.2em"}}>
      <div style={{display: "flex"}}>
        <div style={{flexGrow: 1, fontSize: "1.3em", fontWeight: 400}}>{record.amount >= 0 ? "+" : ""}{record.amount}</div>
        <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between"}}>
          <div style={{fontSize: "0.9em", color: "#555", display: "flex", flexDirection: "row", gap: "1em", alignItems: "flex-end"}}>
            <div>{formatDate(record.date)}</div>
            <div>{formatTime(record.date)}</div>
          </div>
          <IconButton onClick={() => setDialogOpen(true)}>
            <Delete />
          </IconButton>
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          Verwijderen
        </DialogTitle>
        <DialogContent style={{paddingTop: "0.3em"}}>
          <DialogContentText>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setDialogOpen(false)} autoFocus>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}


export function EditLedgerUser() {
  let params = useParams();
  let navigate = useNavigate();

  let ledgerKey = params.ledgerKey;
  let userKey = params.userKey;

  const [ledger, setLedger] = useState<Ledger | null>(null);

  useEffect(() => {
    if(ledgerKey !== undefined){
      let newLedger = null;
      try {
        newLedger = useCases.readLedger(ledgerKey)
      }
      catch {
        console.log("no ledger found")
      }
      setLedger(newLedger);
    }
    else {
      setLedger(null);
    }
  }, [ledgerKey]);

  if(ledger === null) {
    return <ListLedgers/>;
  }

  if(userKey === undefined) {
    return <EditLedger/>;
  }

  const user = ledger.users.filter(v => v.key === userKey)[0]

  if(user === undefined) {
    return <EditLedger/>;
  }
  
  const userRecords = ledger.records[user.key].map((record, index) => ({record: record, index: index})).sort((a, b) => a.record.date < b.record.date ? +1 : -1);

  const handleDelete = () => {
    setLedger(useCases.deleteLedgerUser(ledger, user.key));
    navigate("..");
  }

  return (
    <div>
      <div style={{display: "flex"}}>
        <div style={{display: "flex", flexGrow: 1}}>
          <EditUserDialog title="Gebruiker aanpassen" user={user} handleSave={(newUser: NewUser) => setLedger(useCases.editLedgerUser(ledger, user.key, newUser))} handleDelete={handleDelete}>
            
            <ListItemAvatar>
              <Avatar>
                {user.name.slice(0, 1).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            
            <h1>{user.name}</h1>

             <Edit sx={{ fontSize: 15 }} style={{marginLeft: "0.2em", marginTop: "-0.2em"}}/>
             
          </EditUserDialog>
        </div>
        <NavLink to={`/${ledger.key}`}><ArrowBack/></NavLink>
      </div>
      
      <List>
        {userRecords.map(({record, index}) => (
          <LedgerUserRecord key={index} record={record} deleteRecord={() => setLedger(useCases.deleteRecordFromLedgerUser(ledger, user, index))}/>
        ))}
      </List>

    </div>
  );
}

