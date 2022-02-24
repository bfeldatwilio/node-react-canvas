import React from "react";

/*
props:
	inLinkMode, boolean value if parent is in SID linking mode
    setInLinkMode, function to toggle the inLinkMode boolean
    onSaveLinks, function when save button on Links view is pressed
    onSavePrimary, function when save button on Primary view is pressed
*/

export default function Header_Options(props) {
	const saveLinks = () => {
		props.onSaveLinks();
	};

	const savePrimary = () => {
		props.onSavePrimary();
	};

	const setLinkMode = () => {
		props.setInLinkMode(!props.inLinkMode);
	};

	const setPrimaryMode = () => {
		props.setInPrimaryMode(!props.inPrimaryMode);
	};

	return (
		<>
			{props.inLinkMode && (
				<div id="linkModeFunctions" className="slds-button-group" role="group">
					<button onClick={saveLinks} className="slds-button slds-button_brand">
						Save
					</button>
					<button onClick={setLinkMode} className="slds-button slds-button_neutral">
						Cancel
					</button>
				</div>
			)}
			{props.inPrimaryMode && (
				<div id="linkModeFunctions" className="slds-button-group" role="group">
					<button onClick={savePrimary} className="slds-button slds-button_brand">
						Save
					</button>
					<button onClick={setPrimaryMode} className="slds-button slds-button_neutral">
						Cancel
					</button>
				</div>
			)}
			{!props.inLinkMode && !props.inPrimaryMode && (
				<div id="defaultFunctions" className="slds-button-group" role="group">
					<button onClick={setLinkMode} className="slds-button slds-button_neutral">
						Link SIDs
					</button>
					<button onClick={setPrimaryMode} className="slds-button slds-button_neutral">
						Set Primary
					</button>
					<button className="slds-button slds-button_neutral">Set Flex</button>
				</div>
			)}
		</>
	);
}
