import { useEffect, useState } from "react";

import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fab, IconButton, List, ListItem, ListItemAvatar, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { Add, ArrowBack, ArrowDropDown, ArrowDropUp, LocalBar, Share, Edit } from "@mui/icons-material";

import type { Ledger, User } from "../domain";
import { NavLink, useNavigate, useParams } from "react-router";
import { formatDate, formatTime, stringToColor, type NewLedger, type NewRecord, type NewUser } from "../useCases";
import { useCases } from "../factory";

import { ListLedgers } from "./ListLedgersView";
import { EditUserDialog } from "../components/EditUserDialog";
import { KeyPad } from "../components/KeyPad";



function LedgerUser({user, balance, addRecord}: {user: User, balance: {total: number, owed: number}, addRecord: (record: NewRecord) => void}) {

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<{amount: string}>({amount: ""});

  const validateAmount = (amount: string) => {
    return isNaN(parseFloat(amount))
  }

  const handleSave = () => {
    if(validateAmount(newRecord.amount)){
      return;
    }
    addRecord({amount: parseFloat(newRecord.amount)});
    setNewRecord({amount: ""});
    setDialogOpen(false);
  }


  return (
    <Paper style={{marginBottom: "0.5em"}}>
      <ListItem>
        <NavLink to={user.key}>
          <ListItemAvatar>
            <Avatar>
              {user.name.slice(0, 1).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
        </NavLink>
        <div style={{width: "100%"}}>
          <div style={{display: "flex", gap: "1em"}}>
            <div style={{flexGrow: 1}}>{user.name}</div>
            <Button onClick={() => addRecord({amount: 50})} variant="outlined" style={{height: "3em"}}>+50</Button>
            <Button onClick={() => setDialogOpen(true)} variant="outlined" style={{height: "3em"}}>Add</Button>
          </div>
          <div style={{display: "flex", fontSize: "0.9em", color: "#555"}}>
            <div style={{flexGrow: 1}}>
              <div>Totaal: {balance.total.toFixed(2)}</div>
              {/* <div>Aandeel: {user.share.toFixed(0)}</div> */}
            </div>
            <div style={{flexGrow: 1}}>Verschil: {balance.owed.toFixed(2)}</div>
          </div>
        </div>
      </ListItem>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          Bedrag toevoegen
        </DialogTitle>
        <DialogContent style={{paddingTop: "0.3em"}}>

          <TextField disabled label="Ander bedrag" value={newRecord.amount} onChange={e => setNewRecord(n => ({...n, amount: e.target.value}))} error={validateAmount(newRecord.amount)} style={{width: "100%"}}/>
          
          <div style={{marginTop: "1em"}}>
            <KeyPad value={newRecord.amount} onChange={value => setNewRecord(n => ({...n, amount: value}))}/>
          </div>

        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} autoFocus>Add</Button>
        </DialogActions>

      </Dialog>

    </Paper>
  );
}


function LedgerSettlement({ledger}: {ledger: Ledger}){

  const ledgerBalance = useCases.getLedgerBalance(ledger);
  const balance = Object.entries(ledgerBalance).map(([k, v]) => ({key: k, amount: v.owed}))
  const [transactions, ] = useCases.calculateBalanceTransactions(balance)
  const usersMap: {[key: string]: User} = ledger.users.reduce((acc, v) => ({...acc, [v.key]: v}), {});

  return (
    <div>
      <h1>Afrekening</h1>
      <div>
        <div style={{flexGrow: 1}}>Totaal: {Object.values(ledgerBalance).reduce((acc, v) => acc + v.total, 0).toFixed(2)}</div>
      </div>
      <div>
        {transactions.map((transaction, index) => (
          <div key={index} style={{display: "flex", width: "100%", maxWidth: "400px"}}>
            <div style={{flexGrow: 1}}>van {usersMap[transaction.from].name} naar {usersMap[transaction.to].name}</div> 
            <div>{transaction.amount.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


function LedgerReport({ledger}: {ledger: Ledger}){
  const [collapsed, setCollapsed] = useState(true);

  const usersMap: {[key: string]: User} = ledger.users.reduce((acc, v) => ({...acc, [v.key]: v}), {});
  const allRecords = useCases.getAllRecords(ledger);
  const ledgerBalance = useCases.getLedgerBalance(ledger);

  return (
    <div>
      <div onClick={() => setCollapsed(v => !v)} style={{cursor: "pointer", display: "flex"}}>
        <h1 style={{flexGrow: 1}}>Rapport</h1>
        <div>
          {collapsed && <ArrowDropDown/>}
          {!collapsed && <ArrowDropUp/>}
        </div>
      </div>

      {!collapsed && (
        <div>
          <TableContainer>
            <Table sx={{ minWidth: 250 }} size="small" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{fontWeight: 800}}>Gebruiker</TableCell>
                  <TableCell align="left" sx={{fontWeight: 800}}>#</TableCell>
                  <TableCell align="right" sx={{fontWeight: 800}}>Betaald</TableCell>
                  <TableCell align="right" sx={{fontWeight: 800}}>Verdeling</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {ledger.users.map(user => (
                  <TableRow key={user.key} sx={{ '&:last-child td, &:last-child th': { border: 0 }, lineHeight: 1}}>
                    <TableCell component="th" scope="row">
                      {user.name}
                    </TableCell>

                    <TableCell component="th" scope="row">
                      {user.share.toFixed(0)}
                    </TableCell>

                    <TableCell component="th" scope="row" align="right">
                      {ledgerBalance[user.key].total.toFixed(2)}
                    </TableCell>

                    <TableCell component="th" scope="row" align="right">
                      {(ledgerBalance[user.key].total + ledgerBalance[user.key].owed).toFixed(2)}
                    </TableCell>

                  </TableRow>
                ))}
                <TableRow
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, lineHeight: 1}}
                  >
                    <TableCell component="th" scope="row" sx={{color: "#555"}}>
                      Totaal
                    </TableCell>

                    <TableCell component="th" scope="row" sx={{color: "#555"}}>
                      {ledger.users.reduce((acc, u) => acc + u.share, 0).toFixed(0)}
                    </TableCell>

                    <TableCell component="th" scope="row" align="right" sx={{color: "#555"}}>
                      {Object.values(ledgerBalance).reduce((acc, v) => acc + v.total, 0).toFixed(2)}
                    </TableCell>

                    <TableCell component="th" scope="row" align="right" sx={{color: "#555"}}>
                      {Object.values(ledgerBalance).reduce((acc, v) => acc + v.total + v.owed, 0).toFixed(2)}
                    </TableCell>

                  </TableRow>

              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer sx={{marginTop: "1em"}}>
            <Table sx={{ minWidth: 250 }} size="small" aria-label="simple table">

              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{fontWeight: 800}}>Datum</TableCell>
                  <TableCell align="left" sx={{fontWeight: 800}}>Gebruiker</TableCell>
                  <TableCell align="right" sx={{fontWeight: 800}}>Bedrag</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {allRecords.map((row, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 }}}>
                    <TableCell component="th" scope="row">
                      <div style={{display: "flex", flexDirection: "column"}}>
                        <div>{formatDate(row.record.date)}</div>
                        <div>{formatTime(row.record.date)}</div>
                      </div>
                    </TableCell>

                    <TableCell component="th" scope="row">
                      {usersMap[row.user].name}
                    </TableCell>

                    <TableCell component="th" scope="row" align="right">
                      {row.record.amount.toFixed(2)}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
}


export function EditLedger() {
  let params = useParams();
  let navigate = useNavigate();

  let ledgerKey = params.ledgerKey;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLedger, setNewLedger] = useState<NewLedger>({name: ""});
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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

  const ledgerBalance = useCases.getLedgerBalance(ledger);

  const handleSave = () => {
    setLedger(useCases.editLedger(ledger, newLedger));
    setDialogOpen(false);
  }

  const handleDelete = () => {
    useCases.deleteLedger(ledger.key);
    setDialogOpen(false);
    navigate("..");
  }

  const share = () => {
    if(navigator.share) {
      navigator.share({url: useCases.makeExportLedgerUrl(ledger)});
    }
    else if(navigator.clipboard) {
      setSnackbarMessage("Copied to clipboard");
      setSnackbarOpen(true);
      navigator.clipboard.writeText(`${window.location.host}/${useCases.makeExportLedgerUrl(ledger)}`);
    }
    else {
      setSnackbarMessage("Not supported on your device");
      setSnackbarOpen(true);
    }
  }

  return (
    <div>
      <div style={{display: "flex"}}>
        <div style={{display: "flex", flexGrow: 1, cursor: "pointer"}} onClick={() => {setNewLedger({name: ledger.name}); setDialogOpen(true);}}>
          <ListItemAvatar>
            <Avatar sx={{bgcolor: stringToColor(ledger.name)}}>
              <LocalBar/>
            </Avatar>
          </ListItemAvatar>
          <h1 style={{alignItems: "start"}}>{ledger.name}</h1>
          <Edit sx={{ fontSize: 15 }} style={{marginLeft: "0.2em", marginTop: "-0.2em"}}/>
        </div>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            Rekening aanpassen
          </DialogTitle>
          <DialogContent style={{gap: "0.5em", paddingTop: "0.3em"}}>
            <TextField label="Naam" value={newLedger.name} onChange={e => setNewLedger(n => ({...n, name: e.target.value}))}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=> setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} autoFocus>Save</Button>
            <Button onClick={handleDelete}>Delete</Button>
          </DialogActions>
        </Dialog>
      
        <NavLink to="/"><ArrowBack/></NavLink>
      </div>
      
      <List>
        {ledger.users.map(user => (
          <LedgerUser key={user.key} user={user} balance={ledgerBalance[user.key]} addRecord={(record: NewRecord) => setLedger(useCases.addRecordToLedgerUser(ledger, user, record))}/>
        ))}
      </List>

      <div style={{marginTop: "-1.5em", }}>
        <EditUserDialog title="Gebruiker toevoegen" user={{key: "", name: "", share: 1}} handleSave={(newUser: NewUser) => setLedger(useCases.addUserToLedger(ledger, newUser))} > 
          <Fab color="primary" aria-label="add">
            <Add />
          </Fab>
        </EditUserDialog>
                  
      </div>
      
      <Divider component="div" style={{marginTop: "1em", marginBottom: "1em"}}/>

      <LedgerSettlement ledger={ledger} />

      <Divider component="div" style={{marginTop: "1em", marginBottom: "1em"}}/>

      <LedgerReport ledger={ledger}/>

      <Divider component="div" style={{marginTop: "1em", marginBottom: "1em"}}/>

      <a href="#" onClick={() => share()} style={{display: "flex", alignItems: "center", gap: "0.5em"}}>
        <Share />
        <div>Een kopie delen</div>
      </a>

      <Snackbar open={snackbarOpen} autoHideDuration={1000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} />

    </div>
  );
}

