import React from "react";
import { Navbar, NavbarBrand, Nav, NavItem } from "reactstrap";

const HeaderBar = ({ title, address, userType }) => {
  return (
    <Navbar color="dark" light expand="md" className="text-white">
      <NavbarBrand>
        <b>{title}</b>
      </NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem>
          {userType}, {address}
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default HeaderBar;
