import './App.css'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";


import { EditLedger } from './views/LedgerView';
import { ListLedgers } from './views/ListLedgersView';
import { EditLedgerUser } from './views/LedgerUserView';
import { ImportLedger } from './views/ImportLedger';


const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: ListLedgers },
      { path: ":ledgerKey", children: [
        { index: true, Component: EditLedger },
        { path: ":userKey", Component: EditLedgerUser },
      ]},
      { path: "import/:data", Component: ImportLedger },
    ]
  },
]);



function App() {
  
  return (
    <RouterProvider router={router} />
  )

}

export default App
