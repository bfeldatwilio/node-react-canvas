import { rest } from "msw";
import { setupServer } from "msw/node";
import * as canvasUtils from "../../utils/canvasUtil";
import { render, fireEvent, cleanup, screen, logRoles } from "@testing-library/react";
import NoSIDResponse from "../../mocks/sample_responses/ajaxCallCompositePromiseEmptyResponse.json";
import "@testing-library/jest-dom";
import SIDSelector from "./index";

jest.mock("../../utils/canvasUtil");

// cannot figure out how to get rid of the "not wrapped in an act() function error showing up for each test
// author of React Testing Library states wrapping in async and await will also wrap in an act, however this doesn't seem to work
// below squelches errors in the console
jest.spyOn(console, "error");
console.error.mockImplementation(() => {});

describe("Renders initial state without data", () => {
	let spy;

	beforeEach(async () => {
		spy = jest.spyOn(canvasUtils, "ajaxCallCompositePromise").mockImplementation(async () => {
			return await Promise.resolve(NoSIDResponse.payload);
		});
		await render(<SIDSelector />);
	});
	afterAll(() => {
		cleanup();
		spy.mockRestore();
	});
	it("should show the header", async () => {
		expect(await screen.findByText(/SIDs \(/)).toBeInTheDocument();
	});
	it("should display agreement SID count", async () => {
		expect(await screen.findByText(/SIDs \(/)).toHaveTextContent("0");
	});
	it("should be showing the image placeholder", async () => {
		expect(await screen.findByAltText("No Agreement SIDs yet")).toBeInTheDocument();
	});
	it("should have the Link SIDs button with the brand class", async () => {
		let linkBtn = await screen.findByRole("button", { name: /Link SIDs/ });
		expect(linkBtn).toBeInTheDocument();
		expect(linkBtn).toHaveClass("slds-button_brand");
	});
	it("should disable the Primary Button", async () => {
		let primaryBtn = await screen.findByRole("button", { name: /Set Primary/ });
		expect(primaryBtn).toBeInTheDocument();
		expect(primaryBtn).toBeDisabled();
	});
	it("should disable the Flex Button", async () => {
		let flexBtn = await screen.findByRole("button", { name: /Set Flex/ });
		expect(flexBtn).toBeInTheDocument();
		expect(flexBtn).toBeDisabled();
	});
});

describe("Renders initial state with Data", () => {
	beforeEach(async () => {
		await render(<SIDSelector />);
	});
	afterEach(() => {
		cleanup();
	});
	it("should show the loading spinner", async () => {
		expect(await screen.findByRole("status")).not.toBeInTheDocument();
	});
	it("should show the header", async () => {
		expect(await screen.findByText(/SIDs \(/)).toBeInTheDocument();
	});
	it("should show agreement SID count of 5", async () => {
		expect(await screen.findByText(/SIDs \(/)).toHaveTextContent("5");
	});
	xit("should have 5 list items", async () => {
		expect(await screen.findAllByRole("listitem")).toHaveLength(5);
	});
	it("should have the link button", async () => {
		expect(await screen.findByRole("button", { name: /Link SIDs/ })).toBeInTheDocument();
	});
	it("should have the Set Primary button", async () => {
		expect(await screen.findByRole("button", { name: /Set Primary/ })).toBeInTheDocument();
	});
	it("Set Primary Button should not be disabled", async () => {
		expect(await screen.findByText("Set Primary")).not.toBeDisabled();
	});
	it("should have the Set Flex button", async () => {
		expect(await screen.findByText("Set Flex")).toBeInTheDocument();
	});
	it("Set Flex Button should not be disabled", async () => {
		expect(await screen.findByText("Set Flex")).not.toBeDisabled();
	});
	it("should show the first item as Primary", async () => {
		expect(await screen.findByText("Primary")).toBeInTheDocument();
	});
	xit("should not show the check boxes", async () => {
		let topCheckbox = await screen.findByRole("checkbox", {
			name: /Unlink AC2091aca097661f6738faee8c56dd8207/,
		});
		expect(topCheckbox).not.toBeInTheDocument;
	});
	xit("should not show the radio buttons", async () => {
		let topRadio = await screen.findByRole("radio", {
			name: /Make Primary AC1456d89dc62a87b4cd221234781a464/,
		});
		expect(topRadio).not.toBeInTheDocument;
	});
});

describe("clicking Link Button", () => {
	let linkBtn;
	beforeEach(async () => {
		await render(<SIDSelector />);
		linkBtn = await screen.findByRole("button", { name: /Link SIDs/ });
		fireEvent(
			linkBtn,
			new MouseEvent("click", {
				bubbles: true,
				cancelable: true,
			})
		);
	});
	afterEach(() => {
		cleanup();
	});
	it("should hide the Link SIDs button", async () => {
		expect(await linkBtn).not.toBeInTheDocument();
	});
	it("should show the save button", async () => {
		expect(
			await screen.findByRole("button", { name: /Save Modified Links/ })
		).toBeInTheDocument();
	});
	// it("should show the check boxes", async () => {
	// 	let topCheckbox = await screen.findByRole("checkbox", {
	// 		name: /Unlink AC2091aca097661f6738faee8c56dd8207/,
	// 	});
	// 	screen.debug(topCheckbox);
	// 	expect(topCheckbox).toHaveClass("show");
	// });
});
