import React, { useState } from "react";

/*
props:
	inLinkMode, boolean value if parent is in SID linking mode
    setInLinkMode, function to toggle the inLinkMode boolean
    inPrimaryMode, boolean value if the parent is in SID Primary selection mode
	inFlexMode, boolean value if the parent is in the SID Flex selection mode
    setInPrimaryMode, function to toggle the inPrimary boolean and show the primary form
    onSaveLinks, function when save button on Links view is pressed
    onSavePrimary, function when save button on Primary view is pressed
    noSIDs, if there are no agreement sids, disable the add flex/primary buttons
*/

export default function Header_Options(props) {
	const [disableSave, setDisableSave] = useState(false);

	const saveLinks = () => {
		props.onSaveLinks();
		setDisableSave(true);
	};

	const savePrimary = () => {
		props.onSavePrimary();
		setDisableSave(true);
	};

	const saveFlex = () => {
		props.onSaveFlex();
		setDisableSave(true);
	};

	const setLinkMode = () => {
		props.setInLinkMode(!props.inLinkMode);
		setDisableSave(false);
	};

	const setPrimaryMode = () => {
		props.setInPrimaryMode(!props.inPrimaryMode);
		setDisableSave(false);
	};

	const setFlexMode = () => {
		props.setInFlexMode(!props.inFlexMode);
		setDisableSave(false);
	};

	return (
		<>
			{props.inLinkMode && (
				<div id="linkModeFunctions" className="slds-button-group" role="group">
					<button
						disabled={disableSave}
						onClick={saveLinks}
						aria-label="Save Modified Links"
						className="slds-button slds-button_brand">
						Save Links
					</button>
					<button
						onClick={setLinkMode}
						aria-label="Cancel Modified Links"
						className="slds-button slds-button_neutral">
						Cancel
					</button>
				</div>
			)}
			{props.inPrimaryMode && (
				<div id="primaryModeFunctions" className="slds-button-group" role="group">
					<button
						disabled={disableSave}
						onClick={savePrimary}
						aria-label="Save Modified Primary"
						className="slds-button slds-button_brand">
						Save Primary
					</button>
					<button
						onClick={setPrimaryMode}
						aria-label="Cancel Modified Primary"
						className="slds-button slds-button_neutral">
						Cancel
					</button>
				</div>
			)}
			{props.inFlexMode && (
				<div id="flexModeFunctions" className="slds-button-group" role="group">
					<button
						disabled={disableSave}
						onClick={saveFlex}
						aria-label="Save Modified Flex"
						className="slds-button slds-button_brand">
						Save Flex
					</button>
					<button
						onClick={setFlexMode}
						aria-label="Cancel Modified Flex"
						className="slds-button slds-button_neutral">
						Cancel
					</button>
				</div>
			)}
			{!props.inLinkMode && !props.inPrimaryMode && !props.inFlexMode && (
				<div id="defaultFunctions" className="slds-button-group" role="group">
					<button
						onClick={setLinkMode}
						aria-label="Link SIDs"
						className={`slds-button ${
							props.noSIDs ? "slds-button_brand" : "slds-button_neutral"
						}`}>
						Link SIDs
					</button>
					<button
						aria-label="Set Primary"
						disabled={props.noSIDs}
						onClick={setPrimaryMode}
						className="slds-button slds-button_neutral">
						Set Primary
					</button>
					<button
						disabled={props.noSIDs}
						aria-label="Set Flex"
						onClick={setFlexMode}
						className="slds-button slds-button_neutral">
						Set Flex
					</button>
				</div>
			)}
		</>
	);
}
