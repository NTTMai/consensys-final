import React from "react";
import { Row, Button, Table } from "reactstrap";

let styleP = {
  borderBottom: "1px solid black",
  padding: "5px 5px 2px 0px",
  margin: "10px",
  textAlign: "left"
};
let styleT = { margin: "5px" };
let styleBtn = { width: "110px" };

const ClientOnly = ({ isOwner, onClickBuy, articlesArray }) => {
  if (isOwner === "client") {
    return (
      <div>
        <h4 style={styleP}>Client only functions</h4>
        <Row style={styleT}>
          <Table striped size="sm" id="table" style={styleT}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Buy</th>
              </tr>
            </thead>
            <tbody>
              {articlesArray.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>
                    <Button
                      style={styleBtn}
                      onClick={_ => onClickBuy(p.id)}
                      color="success"
                      size="sm"
                    >
                      {p.price} ETH
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Row>
      </div>
    );
  } else {
    return null;
  }
};

export default ClientOnly;
