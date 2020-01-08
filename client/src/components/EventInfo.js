import React from "react";
import {} from "reactstrap";

let styleP = {
  borderBottom: "1px solid black",
  padding: "5px 5px 2px 0px",
  margin: "10px",
  textAlign: "left"
};

const EventInfo = ({}) => {
  return (
    <div>
      <p style={styleP}>Events</p>
      <ul id="events"></ul>
    </div>
  );
};

export default EventInfo;
