import React from "react";
import { Button } from "reactstrap";

let styleP = {
  borderBottom: "1px solid black",
  padding: "5px 12px 2px 0px",
  margin: "10px",
  textAlign: "left"
};
let styleBtn = { margin: "1px" };
let styleDiv = { textAlign: "left" };

const AccountInfoBar = ({
  onClick1,
  onClick2,
  onClick3,
  network,
  accountBalance,
  storeBalance,
  userType
}) => {
  return (
    <div style={styleDiv}>
      <p style={styleP}>Account info & actions</p>
      UserType: {userType}
      <div>
        <Button style={styleBtn} color="primary" size="sm" onClick={onClick1}>
          setStorage(30)
        </Button>
        <Button style={styleBtn} color="secondary" size="sm" onClick={onClick2}>
          btnLog
        </Button>
        <Button style={styleBtn} color="success" size="sm" onClick={onClick3}>
          btn3
        </Button>
      </div>
    </div>
  );
};

export default AccountInfoBar;
