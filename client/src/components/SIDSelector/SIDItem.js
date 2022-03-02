import React, { useState, useEffect } from "react";
/*
props:
	sid, AgreementSID passed in from the parent
	agreementCurrency, the currency of the agreement to indicate match or mismatch
	navToSID, function taking the Account SID Id SF navigation
	inLinkMode: toggle if in link UI mode for linking SIDs
	inPrimaryMode: toggle if in select primary SID mode
	inFlexMode: toggle if in select flex SID mode
	onDisassociationChange: handler for already associated SIDs
	onAssociationChange: handler for opportunity SIDs
	onPrimaryChange: function to call when the radio has changed
	newPrimarySID: the currently selected primary SID
	*/

export default function SIDItem(props) {
	const sid = props.sid;
	const alreadyLinked = sid.attributes.type === "Agreement_SID__c";
	const alreadyPrimary = alreadyLinked ? sid.Is_Primary_Account_SID__c : false;
	const attribute = alreadyPrimary ? " Primary" : sid.Is_Flex_Account_SID__c ? " Flex" : "";
	const stateClasses = {
		AGREEMENTSIDREMOVED: "red_bg",
		OPPYSIDADDED: "green_bg",
		NOTHING: "",
	};

	const [toBeRemoved, setToBeRemoved] = useState(false);
	const [toBeAdded, setToBeAdded] = useState(false);
	const [checked, setChecked] = useState(alreadyLinked);
	const [radioOn, setRadioOn] = useState(false);
	const [activeClass, setActiveClass] = useState(stateClasses.NOTHING);

	const setDefaultState = () => {
		setToBeAdded(false);
		setToBeRemoved(false);
		setChecked(alreadyLinked);
		setRadioOn(alreadyPrimary);
		setActiveClass(stateClasses.NOTHING);
	};

	useEffect(() => {
		setDefaultState();
	}, [props.inLinkMode, props.inPrimaryMode]);

	useEffect(() => {
		setActiveClass(toBeAdded ? stateClasses.OPPYSIDADDED : stateClasses.NOTHING);
		props.onAssociationChange(sid, toBeAdded);
	}, [toBeAdded]);

	useEffect(() => {
		setActiveClass(toBeRemoved ? stateClasses.AGREEMENTSIDREMOVED : stateClasses.NOTHING);
		props.onDisassociationChange(sid, toBeRemoved);
	}, [toBeRemoved]);

	useEffect(() => {
		if (props.newPrimarySID) {
			let imSelected = props.newPrimarySID.Id === sid.Id;
			setRadioOn(imSelected);
		}
	}, [props.newPrimarySID]);

	const onCheckChange = (e) => {
		let isChecked = e.currentTarget.checked;
		setChecked(isChecked);

		if (alreadyLinked) {
			setToBeRemoved(!isChecked);
		} else {
			setToBeAdded(isChecked);
		}
	};

	const onRadioChanged = () => {
		setRadioOn(!radioOn);
		props.onPrimaryChange(sid);
	};

	const nav_to_sid = (e) => {
		e.preventDefault();
		props.navToSID(sid.Account_SID__r.Id);
	};

	const currencyMatchesParent = () => {
		return (
			props.agreementCurrency.toUpperCase() ===
			props.sid.Account_SID__r.Customer_currency__c.toUpperCase()
		);
	};

	return (
		<tr className={activeClass}>
			<td className="nostyle">
				<div className={`editArea ${props.inLinkMode ? "show" : ""}`}>
					<input
						className="slds-checkbox"
						onChange={onCheckChange}
						type="checkbox"
						checked={checked}></input>
				</div>
			</td>
			<td className="nostyle">
				<div className={`editArea ${props.inPrimaryMode ? "show" : ""}`}>
					<input
						onChange={onRadioChanged}
						type="radio"
						value={sid.Id}
						id={sid.Id}
						checked={radioOn}
						name="primary"></input>
				</div>
			</td>
			<td>
				<div>
					<a onClick={nav_to_sid}>{sid.Account_SID__r.Name}</a>
					<span className="highlight">{attribute}</span>
					<div className="sub_sid_data">
						{sid.Account_SID__r.SID_Entity__c}
						<span>, type:</span>
						{sid.Account_SID__r.Account_SID_Type__c}
						<span>, status:</span>
						{sid.Account_SID__r.Account_SID_Status__c}
						<span>, created:</span>
						{sid.Account_SID__r.Account_SID_Created_Date__c}
					</div>
				</div>
			</td>
			<td>
				<div className={`sub_sid_data ${!currencyMatchesParent() ? "red-text" : ""}`}>
					<div>
						<span>SW MMR: </span>
						{sid.Account_SID__r.Software_MRR__c}{" "}
						{sid.Account_SID__r.Customer_currency__c}
					</div>
					<div className="sub_sid_data">
						<span>Tot MMR: </span>
						{sid.Account_SID__r.Total_MRR__c} {sid.Account_SID__r.Customer_currency__c}
					</div>
				</div>
			</td>
		</tr>
	);
}
