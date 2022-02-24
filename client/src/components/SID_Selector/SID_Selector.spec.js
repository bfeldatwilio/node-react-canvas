import React from "react";
import { mount } from "@cypress/react";
import SID_Selector from "./index";

it("renders AgreementInfo", () => {
	mount(<SID_Selector />);
	cy.get("h2").contains("Agreement Info");
});
