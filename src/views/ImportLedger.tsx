import { useEffect } from "react";

import {  useNavigate, useParams } from "react-router";
import { useCases } from "../factory";


export function ImportLedger() {
  let params = useParams();
  let navigate = useNavigate();

  let ledgerString = params.data;

  useEffect(() => {
    console.log('i fire once');

    if(ledgerString === undefined){
      navigate("/");
      return
    }

    try {
      let ledger = useCases.importLedger(ledgerString);
      navigate(`/${ledger.key}`);
    }
    catch {
      console.log("import error");
      navigate("/");
    }
    
  }, []);

  return null;
}

