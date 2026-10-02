import { useState, type ReactNode } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import type { NewUser } from "../useCases";
import type { User } from "../domain";


export function EditUserDialog({title, user, handleSave, handleDelete, children}: {title: string, user: User, handleSave: (user: NewUser) => void, handleDelete?: () => void, children: ReactNode | Array<ReactNode>}) {

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<{name: string, share: string}>({name: user.name, share: user.share.toFixed()});

  const validateShare = (share: string) => {
    return isNaN(parseInt(share)) || parseInt(share) < 0
  }

  const localHandleSave = () => {
    if(validateShare(newUser.share)) {
      return
    }

    handleSave({name: newUser.name, share: parseInt(newUser.share)});
    setDialogOpen(false)
  }

  const localHandleDelete = () => {
    if(handleDelete === undefined) {
      return
    }
    handleDelete();
    setDialogOpen(false);
  }

  return (

    <div>
      <div style={{display: "flex", flexGrow: 1, cursor: "pointer"}} onClick={() => {setNewUser({name: user.name, share: user.share.toFixed()}); setDialogOpen(true);}}>
        {children}
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {title}
        </DialogTitle>
        <DialogContent style={{display: "flex", flexDirection: "column", gap: "0.5em", paddingTop: "0.3em"}}>
          <TextField label="Naam" value={newUser.name} onChange={e => setNewUser(n => ({...n, name: e.target.value}))}/>
          <TextField label="Aandeel" value={newUser.share} onChange={e => setNewUser(n => ({...n, share: e.target.value}))} error={validateShare(newUser.share)}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setDialogOpen(false)}>Cancel</Button>
          <Button onClick={localHandleSave} autoFocus>Save</Button>
          {handleDelete !== undefined && (<Button onClick={localHandleDelete}>Delete</Button>)}
        </DialogActions>
      </Dialog>
    </div>

  );
}

