export interface Record {
  amount: number;
  date: Date;
}


export interface User {
  key: string;
  name: string;
  share: number;
}


export interface Ledger {
  key: string;
  name: string;
  users: Array<User>;
  records: {[user: string]: Array<Record>};
}


export interface LedgerName {
  key: string;
  name: string;
}


export interface LedgerBalance {
  [user: string]: {total: number, owed: number};
}


export interface Transaction {
    from: string;
    to: string;
    amount: number;
}
