import { LocalStorageLedgerRepository } from "./LocalStorageRepository";
import { UseCases } from "./useCases";

const repository = new LocalStorageLedgerRepository();

export const useCases = new UseCases(repository);
