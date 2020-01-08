import React from "react";
import { Row, Col, FormGroup, Form, FormText, Input, Button } from "reactstrap";

let styleP = {
  borderBottom: "1px solid black",
  padding: "5px 5px 2px 0px",
  margin: "10px",
  textAlign: "left"
};
let styleF = { margin: "0px 0px 0px 10px" };
let styleFG = { textAlign: "left", marginLeft: "5px" };
let styleBtn = { width: "80px" };

const OwnerOnly = ({ isOwner, onClickAdd, onClickDisable, onClickCheck }) => {
  if (isOwner === "owner") {
    return (
      <div>
        <h4 style={styleP}>OwnerOnly functions</h4>
        <Row>
          <Col xs="10">
            <Form style={styleF}>
              <FormGroup>
                <Input
                  type="text"
                  id="newAdminAddress"
                  placeholder="new Admin Address"
                />
                <FormText style={styleFG} id="newAdminFormText">
                  _
                </FormText>
              </FormGroup>
            </Form>
          </Col>
          <Col xs="2">
            <Button style={styleBtn} onClick={onClickAdd}>
              Add
            </Button>
          </Col>
        </Row>

        <Row>
          <Col xs="10">
            <Form style={styleF}>
              <FormGroup>
                <Input
                  type="text"
                  id="disableAdminAddress"
                  placeholder="disable Admin Address"
                />
                <FormText style={styleFG} id="disableAdminFormText">
                  _
                </FormText>
              </FormGroup>
            </Form>
          </Col>
          <Col xs="2">
            <Button style={styleBtn} onClick={onClickDisable}>
              disable
            </Button>
          </Col>
        </Row>

        <Row>
          <Col xs="10">
            <Form style={styleF}>
              <FormGroup>
                <Input
                  type="text"
                  id="checkAdminAddress"
                  placeholder="check if address is admin"
                />
                <FormText style={styleFG} id="checkAdminFormText">
                  {" "}
                  admins() returned _
                </FormText>
              </FormGroup>
            </Form>
          </Col>
          <Col xs="2">
            <Button style={styleBtn} onClick={onClickCheck}>
              check
            </Button>
          </Col>
        </Row>
        <br />
      </div>
    );
  } else {
    return null;
  }
};

export default OwnerOnly;
