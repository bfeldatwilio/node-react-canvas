import React from "react";
import {
	getRefreshSignedRequest,
	ajaxCallCompositePromise,
	ajaxCall,
	publishEvent,
} from "../../utils/canvasUtil";
import {
	removeAgreementSIDs,
	agreementSidSOQL,
	sortAgreementSIDs,
	opportunitySIDSKUSOQL,
	additAgreementSIDs,
	createAgreementSIDRequest,
} from "./SIDSelectorHelper";

import Enzyme, { mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import SIDSelector from "./index";
import { Response as srResponse } from "../../mocks/sample_responses/signedResponse";
import { Response as dataResponse } from "../../mocks/sample_responses/loadPageDataResponse";

Enzyme.configure({ adapter: new Adapter() });

jest.mock("../../utils/canvasUtil");
jest.mock("../../utils/SIDSelectorHelper");

const renderMainElement = () => {
	getRefreshSignedRequest;
	return mount(<SIDSelector />);
};

test("Renders the component loader is spinning", () => {
	const wrapper = renderMainElement();

	expect;
});
