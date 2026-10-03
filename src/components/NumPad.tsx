import { Button } from "@mui/material";
import BackspaceIcon from '@mui/icons-material/Backspace';
import { useState } from "react";


export function NumPad({value, onChange}: {value: string, onChange: (v: string) => void}) {
  const [initial, setInitial] = useState(true);

  const handleTap = (v: string) => {
    if(initial) {
      setInitial(false);
      return "";
    }
    return v;
  }

  const tapNumber = (v: number) => {
    onChange(handleTap(value) + v.toFixed(0));
  }
  const tapBack = () => {
    if(value.length == 0){
      return
    }
    onChange(value.slice(0, value.length-1));
  }
  const tapDot = () => {
    if(value.length == 0){
      onChange(value + "0.");
      return
    }
    onChange(value + ".");
  }
  const tapMinus = () => {
    if(value.length == 0){
      onChange("-");
      return
    }
    if(value.startsWith("-")){
      onChange(value.slice(1));
      return
    }
    onChange("-" + value);
  }

  const buttonStyle = {height: "3em", width: "3em"};
  const wideButtonStyle = {height: "3em", width: "5em"};

  return (
    <div style={{display: "flex", gap: "0.5em", flexDirection: "column", width: "100%"}}>
      <div style={{display: "flex", gap: "0.5em", justifyContent: "center", width: "100%"}}>
        <Button onClick={() => tapNumber(1)} variant="outlined" style={buttonStyle}>1</Button>
        <Button onClick={() => tapNumber(2)} variant="outlined" style={buttonStyle}>2</Button>
        <Button onClick={() => tapNumber(3)} variant="outlined" style={buttonStyle}>3</Button>
        <Button onClick={() => tapBack()} variant="contained" style={wideButtonStyle}><BackspaceIcon/></Button>
      </div>
      <div style={{display: "flex", gap: "0.5em", justifyContent: "center"}}>
        <Button onClick={() => tapNumber(4)} variant="outlined" style={buttonStyle}>4</Button>
        <Button onClick={() => tapNumber(5)} variant="outlined" style={buttonStyle}>5</Button>
        <Button onClick={() => tapNumber(6)} variant="outlined" style={buttonStyle}>6</Button>
        <Button onClick={() => tapDot()} variant="contained" style={wideButtonStyle}>.</Button>
      </div>
      <div style={{display: "flex", gap: "0.5em", justifyContent: "center"}}>
        <Button onClick={() => tapNumber(7)} variant="outlined" style={buttonStyle}>7</Button>
        <Button onClick={() => tapNumber(8)} variant="outlined" style={buttonStyle}>8</Button>
        <Button onClick={() => tapNumber(9)} variant="outlined" style={buttonStyle}>9</Button>
        <Button onClick={() => tapMinus()} variant="contained" style={wideButtonStyle}>{parseFloat(value) >= 0 ? "-" : "+"}</Button>
      </div>
      <div style={{display: "flex", gap: "0.5em", justifyContent: "center"}}>
        <Button disabled style={buttonStyle}></Button>
        <Button onClick={() => tapNumber(0)} variant="outlined" style={buttonStyle}>0</Button>
        <Button disabled style={buttonStyle}></Button>
        <Button disabled style={wideButtonStyle}></Button>
      </div>
    </div>
  )
}