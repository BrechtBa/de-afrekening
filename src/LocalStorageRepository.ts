import type { Ledger, Record, User } from "./domain";
import type { LedgerRepository } from "./useCases";

interface UserDTO{
  key: string;
  name: string;
  share?: number;
}

interface RecordDTO{
  amount: number,
  date: string
}

interface LedgerDTO {
  name: string;
  defaultAmount: number;
  users: Array<UserDTO>;
  records: {[user: string]: Array<RecordDTO>}
}


export class LocalStorageLedgerRepository implements LedgerRepository {
  constructor(){};

  store_ledger(ledger: Ledger): void{

    localStorage.setItem(this.makeKey(ledger.key), JSON.stringify(this.ledgerToLedgerDTO(ledger)));

    // update ledger names
    var namesObject = this.get_ledger_names()
    namesObject[ledger.key] = {name: ledger.name};
    localStorage.setItem("ledgers", JSON.stringify(namesObject));
  }

  read_ledger(key: string): Ledger {
    let val = localStorage.getItem(this.makeKey(key));
    if(val === null){
      throw new Error("no such ledger");
    }
    return this.ledgerDTOToLedger(key, JSON.parse(val) as LedgerDTO);
  }

  delete_ledger(key: string): void {
    localStorage.removeItem(this.makeKey(key));

    var namesObject = this.get_ledger_names()
    delete namesObject[key];
    localStorage.setItem("ledgers", JSON.stringify(namesObject));
  }

  read_ledger_names(): Array<{key: string, name: string}> {
    let val = localStorage.getItem("ledgers");
    if(val === null){
      return [];
    }
    return Object.entries(JSON.parse(val) as {[key: string]: {name: string}}).map(([k, v]: [k: string, v: {name: string}]) => ({key: k, name: v.name}));
  }

  private get_ledger_names(): {[key: string]: {name: string}} {
    var names = localStorage.getItem("ledgers");
    var namesObject: {[keys: string]: {name: string}} = {};
    if( names !== null ) {
      namesObject = JSON.parse(names);
    }
    return namesObject;
  }

  private recordDTOToRecord(recordDTO: RecordDTO): Record {
    return {
      amount: recordDTO.amount,
      date: new Date(recordDTO.date)
    }
  }

  private recordToRecordDTO(record: Record): RecordDTO {
    return {
      amount: record.amount,
      date: record.date.toISOString(),
    }
  }
  
  private userDTOToUser(userDTO: UserDTO): User {
    return {
      key: userDTO.key,
      name: userDTO.name,
      share: userDTO.share === undefined ? 1 : userDTO.share
    };
  }

  private userToUserDTO(user: User): UserDTO {
    return user as UserDTO;
  }

  private ledgerDTOToLedger(key: string, ledgerDTO: LedgerDTO): Ledger{
    return {
      key: key,
      name: ledgerDTO.name,
      defaultAmount: ledgerDTO.defaultAmount || 50,
      users: ledgerDTO.users.map(user => this.userDTOToUser(user)),
      records: Object.keys(ledgerDTO.records).reduce((acc: {[user: string]: Array<Record>}, v: string) => {
        acc[v] = ledgerDTO.records[v].map(r => this.recordDTOToRecord(r))
        return acc;
      }, {}),
      
    }
  }
  private ledgerToLedgerDTO(ledger: Ledger): LedgerDTO{
    return {
      name: ledger.name,
      defaultAmount: ledger.defaultAmount,
      users: ledger.users.map(user => this.userToUserDTO(user)),
      records: Object.keys(ledger.records).reduce((acc: {[user: string]: Array<RecordDTO>}, v: string) => {
        acc[v] = ledger.records[v].map(r => this.recordToRecordDTO(r))
        return acc;
      }, {}),
    }

  }

  private makeKey(key: string): string {
    return `ledgers__${key}`;
  }

}
