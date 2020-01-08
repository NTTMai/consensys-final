import React from "react";
import { Row, Col, FormGroup, Form, Input, Button, Table } from "reactstrap";

let styleP = {
  borderBottom: "1px solid black",
  padding: "5px 5px 2px 0px",
  margin: "10px",
  textAlign: "left"
};
let styleF = { margin: "0px 0px 0px 10px" };
let styleT = { margin: "5px" };
let styleBtn = { width: "200px" };

const AdminOnly = ({
  isOwner,
  onClickAdd,
  onClickChange,
  articlesArray,
  balance,
  onClickWithdraw
}) => {
  if (isOwner === "storeOwner") {
    return (
      <div>
        <Row>
          <Col xs="10">
            <h4 style={styleP}>StoreOwner only functions</h4>
            <Form style={styleF}>
              <FormGroup>
                <Input
                  type="text"
                  id="articleName"
                  placeholder="Name of new article"
                />
              </FormGroup>
              <FormGroup>
                <Input
                  type="textarea"
                  id="articleDescription"
                  placeholder="Description of new article"
                />
              </FormGroup>
              <FormGroup>
                <Input
                  type="number"
                  step="1"
                  id="articlePrice"
                  placeholder="article price"
                />
              </FormGroup>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col xs="3">
            <Button style={styleBtn} onClick={onClickAdd}>
              Add Article
            </Button>
          </Col>
          <Col xs="4">
            <p>Balance from sales: {balance} ETH</p>
          </Col>
          <Col xs="3">
            <Button style={styleBtn} color="success" onClick={onClickWithdraw}>
              Withdraw
            </Button>
          </Col>
        </Row>

        <Row style={styleT}>
          <Table size="sm" id="table" style={styleT} striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price (ETH)</th>
                <th>Buyer</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {articlesArray.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>{p.price}</td>
                  <td>{p.buyer}</td>
                  <td>{p.articleState}</td>
                  {p.articleState !== "Sold" ? (
                    <td>
                      <Button
                        onClick={_ => onClickChange(p.id)}
                        color="info"
                        size="sm"
                      >
                        Change status
                      </Button>
                    </td>
                  ) : (
                    <td>-</td>
                  )}
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

export default AdminOnly;
