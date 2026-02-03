import type { Ledger, LedgerBalance, Record, Transaction, User } from "./domain";


export interface NewUser {
  name: string;
  share: number;
};

export interface NewLedger {
  name: string
};

export interface NewRecord {
  amount: number;
};


export interface LedgerRepository {
  store_ledger(ledger: Ledger): void;
  read_ledger(key: string): Ledger;
  read_ledger_names(): Array<{key: string, name: string}>;
  delete_ledger(key: string): void;
}


export class UseCases {
  ledgerRepository: LedgerRepository

  constructor(ledgerRepository: LedgerRepository){
    this.ledgerRepository = ledgerRepository
  }

  readLedgerNames(): Array<{key: string, name: string}> {
    return this.ledgerRepository.read_ledger_names();
  }

  readLedger(key: string): Ledger {
    return this.ledgerRepository.read_ledger(key);
  }


  createNewLedger(newLedger: NewLedger): Ledger {
    let key = this.makeKey();
    let ledger = {
      key: key,
      ...newLedger,
      users: [],
      records: {}
    }
    this.ledgerRepository.store_ledger(ledger);
    return ledger;
  }

  editLedger(ledger: Ledger, newLedger: NewLedger): Ledger {
    let updatedLedger = {
      key: ledger.key,
      ...newLedger,
      users: ledger.users,
      records: ledger.records
    }
    this.ledgerRepository.store_ledger(updatedLedger);
    return updatedLedger;
  }

  deleteLedger(key: string): void {
    this.ledgerRepository.delete_ledger(key);
  }

  addUserToLedger(ledger: Ledger, user: NewUser): Ledger {
    let key = this.makeKey();
    let newLedger: Ledger = {
      ...ledger,
      users: [...ledger.users, {key: key, name: user.name, share: user.share}],
      records: {...ledger.records, [key]: []}
    }
    this.ledgerRepository.store_ledger(newLedger);
    return newLedger
  }

  editLedgerUser(ledger: Ledger, userKey: string, user: NewUser): Ledger {
    let newLedger: Ledger = {
      ...ledger,
      users: ledger.users.map(u => u.key === userKey ? ({...u, ...user}): u),
      records: {...ledger.records}
    }
    this.ledgerRepository.store_ledger(newLedger);
    return newLedger
  }

  deleteLedgerUser(ledger: Ledger, userKey: string): Ledger {
    let userKeys = ledger.users.map(u=> u.key);
    let index = userKeys.indexOf(userKey);

    let users = [...ledger.users];
    users.splice(index, 1);

    let records = {...ledger.records}
    delete records[userKey]; 

    let newLedger: Ledger = {
      ...ledger,
      users: users,
      records: records
    }
    this.ledgerRepository.store_ledger(newLedger);
    return newLedger
  }

  addRecordToLedgerUser(ledger: Ledger, user: User, record: NewRecord): Ledger {
    let newLedger: Ledger = {
      ...ledger,
      users: [...ledger.users],
      records: {...ledger.records, [user.key]: [...ledger.records[user.key], {...record, date: new Date()}]}
    }
    
    this.ledgerRepository.store_ledger(newLedger);
    return newLedger;
  }

  deleteRecordFromLedgerUser(ledger: Ledger, user: User, index: number): Ledger {
    let userRecords = [...ledger.records[user.key]];
    userRecords.splice(index, 1);

    let newLedger: Ledger = {
      ...ledger,
      users: [...ledger.users],
      records: {...ledger.records, [user.key]: userRecords}
    }
    
    this.ledgerRepository.store_ledger(newLedger);
    return newLedger;
  }

  getAllRecords(ledger: Ledger): Array<{user: string, record: Record}> {
    const allRecords: Array<{record: Record, user: string}> = [];
    Object.keys(ledger.records).forEach(key => {
      allRecords.push(...ledger.records[key].map(r => ({record: r, user: key})))
    });
    return allRecords.sort((a, b) => a.record.date > b.record.date ? 1 : -1);
  }

  getLedgerBalance(ledger: Ledger): LedgerBalance {
    let userTotals: {[user: string]: number} = ledger.users.reduce(
      (acc, user) => ({...acc, [user.key]: ledger.records[user.key].reduce((accUser, record) => accUser + record.amount, 0)}), {}
    );
    let ledgerTotal: number = Object.values(userTotals).reduce((acc, total) => acc + total, 0);
    let userTotalShares: number =  ledger.users.reduce((acc, user) => acc + user.share, 0);

    if(userTotalShares == 0) {
      userTotalShares = 1;
    }

    let ledgerTotalDivided: {[user: string]: number} = ledger.users.reduce((acc, user) => ({...acc, [user.key]: ledgerTotal * user.share / userTotalShares}), {});

    return ledger.users.reduce((acc, user) => ({...acc, [user.key]: {total: userTotals[user.key], owed: ledgerTotalDivided[user.key] - userTotals[user.key]}}), {})
  }

  makeExportLedgerUrl(ledger: Ledger): string {
    let ledgerString = JSON.stringify({
      name: ledger.name, 
      users: ledger.users.map(v => ({k: v.key, n: v.name, s: v.share})), 
      records: Object.entries(ledger.records).reduce((acc, [k, records]) => ({...acc, [k]: records.map(v => ({a: v.amount, d: v.date.toISOString()}))}), {}),
    });
    return `import/${btoa(ledgerString)}` 
  }

  importLedger(ledgerString: string): Ledger {
    const ledgerData: {name: string, users: Array<{k: string, n: string, s: number}>, records: {[key: string]: Array<{a: number, d: string}>}} = JSON.parse(atob(ledgerString));

    const ledger ={
      key: this.makeKey(),
      name: ledgerData.name,
      users: ledgerData.users.map(v => ({key: v.k, name: v.n, share: v.s})),
      records: Object.entries(ledgerData.records).reduce((acc, [k, records]) => ({...acc, [k]: records.map(v => ({amount: v.a, date: new Date(v.d)}))}), {}),
    }

    this.ledgerRepository.store_ledger(ledger);
    return ledger;
  }

  calculateBalanceTransactions(balance: Array<{key: string, amount: number}>): [Array<Transaction>, Array<{key: string, amount: number}>] {
    // return if all entries in balances have the same sign
    let sum_of_signs = balance.reduce((acc, v) => acc + (v.amount >= 0 ? 1 : -1), 0);
    
    if( sum_of_signs === balance.length || sum_of_signs === -balance.length) {
        return [[], balance]
    }
    
    let sortedBalance = balance.sort((a, b) => a.amount < b.amount ? 1 : -1);

    let transactions = []
    let newBalance = [...sortedBalance];
    
    let from = sortedBalance[0];
    let to = sortedBalance[balance.length-1]

    if(from.amount < -to.amount) {
        transactions.push({from: from.key, to: to.key,  amount: from.amount});
        newBalance[newBalance.length-1].amount += from.amount
        newBalance = newBalance.slice(1, newBalance.length);
    }
    else if (from.amount > -to.amount) {
        transactions.push({from: from.key, to: to.key,  amount: -to.amount});
        newBalance[0].amount += to.amount
        newBalance = newBalance.slice(0, newBalance.length-1);
        
    }
    else {
        transactions.push({from: from.key, to: to.key,  amount: from.amount});
        newBalance = newBalance.slice(1, newBalance.length-1);
    }

    let [newTransactions, remainingBalance] = this.calculateBalanceTransactions(newBalance)
    transactions.push(...newTransactions)
    return [transactions, remainingBalance];
  }

  private makeKey(): string {
    let key = crypto.randomUUID();
    return key.replaceAll("-", "").slice(0, 10);
  }

}

export const formatDate = (d: Date): string => {
  const dateString = (d.getDate() > 9 ? "" : "0" ) + d.getDate().toFixed(0);
  const monthString = (d.getMonth() + 1 > 9 ? "" : "0" ) + (d.getMonth()+1).toFixed(0);
  const yearString = d.getFullYear().toFixed(0);

  return `${dateString}-${monthString}-${yearString}`;
}

export const formatTime = (d: Date): string => {
  const hourString = (d.getHours() > 9 ? "" : "0" ) + d.getHours().toFixed(0);
  const minuteString = (d.getMinutes() > 9 ? "" : "0" ) + d.getMinutes().toFixed(0);
  const secondString = (d.getSeconds() > 9 ? "" : "0" ) + d.getSeconds().toFixed(0);

  return `${hourString}:${minuteString}:${secondString}`;
}


export const stringToColor = (string: string): string => {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}
