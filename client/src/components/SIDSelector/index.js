import React, { useEffect, useState, useCallback } from "react";
import "@salesforce/canvas-js-sdk";
import "./SIDSelector.css";
import EmptyState from "../../utils/emptyState";
import {
	getRefreshSignedRequest,
	ajaxCallCompositePromise,
	ajaxCall,
	publishEvent,
	decode,
	resize,
} from "../../utils/canvasUtil";
import {
	removeAgreementSIDs,
	agreementSidSOQL,
	sortAgreementSIDs,
	opportunitySIDSKUSOQL,
	additAgreementSIDs,
	createAgreementSIDRequest,
} from "./SIDSelectorHelper";
import SIDItem from "./SIDItem";
import HeaderOptions from "./headerOptions";

function SIDSelector() {
	const [loading, setLoading] = useState(true);
	const [sr, setSr] = useState();
	const [recordId, setRecordId] = useState();
	const [agreement, setAgreement] = useState();
	const [agreementSIDs, setAgreementSIDs] = useState([]);
	const [opportunitySIDs, setOpportunitySIDs] = useState([]);
	const [inLinkMode, setInLinkMode] = useState(false);
	const [inPrimaryMode, setInPrimaryMode] = useState(false);
	const [newPrimarySID, setNewPrimarySID] = useState();
	const [showOpps, setShowOpps] = useState(false);

	// TODO rename these to SIDsToAssociate, SIDsToDisassociate
	const [SIDsToAssociate, setSIDsToAssociate] = useState([]);
	const [SIDsToDisassociate, setSIDsToDisassociate] = useState([]);

	const setDefaultState = () => {
		setLoading(false);
		setShowOpps(false);
		setInLinkMode(false);
		setInPrimaryMode(false);
	};

	useEffect(() => {
		populateSignedRequest();
	}, []);

	useEffect(() => {
		if (recordId) {
			LoadComponentData();
		}
	}, [recordId]);

	useEffect(() => {
		setSIDsToAssociate([]);
		setSIDsToDisassociate([]);
		setTimeout(() => {
			setShowOpps(inLinkMode);
		}, 300);
	}, [inLinkMode]);

	// Tell Canvas to resize the window after everything loads
	const measuredRef = useCallback(
		(node) => {
			if (node !== null) {
				if (agreement) {
					let nodeHeight = node.getBoundingClientRect().height;
					resize(sr.client, Math.ceil(nodeHeight));
				}
			}
		},
		[agreementSIDs]
	);

	const populateSignedRequest = () => {
		getRefreshSignedRequest().then((data) => {
			let payload = data.payload.response;
			// TODO  Add in the validation.  Get the consumer key from env and decode the payload[0] to verify authenticity
			let part = payload.split(".")[1];
			let signedRequest = decode(part);
			let signedRequestJSON = JSON.parse(signedRequest);
			setSr(signedRequestJSON);
			setRecordId(signedRequestJSON.context.environment.parameters.recordId);
		});
	};

	// const fetchApex = async () => {
	// 	let query = "/services/apexrest/agreementaccountsids/" + recordId;
	// 	ajaxCallPromise(sr.client, query).then((data) => {
	// 		console.log("_____________________APEX__________________");
	// 		console.log(data);
	// 	});
	// };

	const LoadComponentData = async () => {
		setLoading(true);
		const agreementRequest = {
			url:
				sr.context.links.sobjectUrl +
				`Apttus__APTS_Agreement__c/${recordId}?fields=Id, Related_Opportunity_APTS__c, Primary_Account_SID__c, Flex_Account_SID__c, Additional_Account_SIDs__c, Currency_OF_Generate__c, Twilio_Signing_Entity_OF_Generate__c, Payment_Type__c, Name, Account_Legal_Name__c`,
			method: "GET",
			referenceId: "agreement",
		};

		const soqlUrl = sr.context.links.queryUrl + "?q=" + agreementSidSOQL();
		const agreementSIDRequest = {
			url: soqlUrl,
			method: "GET",
			referenceId: "sid",
		};

		const oppySoqlUrl = sr.context.links.queryUrl + "?q=" + opportunitySIDSKUSOQL();
		const oppySIDRequest = {
			url: oppySoqlUrl,
			method: "GET",
			referenceId: "oppySid",
		};

		// format required by SF Composite API
		const compositeRequestObj = {
			compositeRequest: [agreementRequest, agreementSIDRequest, oppySIDRequest],
		};

		let res = await ajaxCallCompositePromise(sr, compositeRequestObj);
		setPageData(res);
	};

	const saveLinksHandler = async () => {
		setLoading(true);

		///services/data/vXX.X/composite/sobjects
		const batchUrl =
			"/services/data/v" + sr.context.environment.version.api + "/composite/sobjects";

		let reqArray = [];
		let SIDsToDisassociateNameArr = SIDsToDisassociate.map((s) => s.Account_SID__r.Name);
		let primaryIsRemoved = false;

		// Create Query to add list of SIDs as batch
		if (SIDsToAssociate.length > 0) {
			let createAgreementSIDReq = createAgreementSIDRequest(
				SIDsToAssociate,
				agreement.Id,
				batchUrl
			);

			reqArray.push(createAgreementSIDReq);
		}

		// create query to delete removed SIDs
		if (SIDsToDisassociate.length > 0) {
			primaryIsRemoved = SIDsToDisassociate.some((s) => s.Is_Primary_Account_SID__c);
			let agreementSIDIdArr = SIDsToDisassociate.map((s) => s.Id);
			let queryString = "/?ids=" + agreementSIDIdArr.join();

			let removeAgreementSIDReq = {
				url: batchUrl + queryString,
				method: "DELETE",
				referenceId: "removeAgreementSids",
			};
			reqArray.push(removeAgreementSIDReq);
		}

		// create Query to update Agreement with newly linked and unlinked SIDs
		let currentSIDNamesNotFlexOrPrimary = additAgreementSIDs(agreementSIDs);
		let SIDsToAssociateNameArr = SIDsToAssociate.map((s) => s.Account_SID__r.Name);
		let currentSIDsPlusNew = [...currentSIDNamesNotFlexOrPrimary, ...SIDsToAssociateNameArr];
		let afterRemovedPulled = currentSIDsPlusNew.filter(
			(sid) => !SIDsToDisassociateNameArr.includes(sid)
		);
		let patchAgreementBody = { Additional_Account_SIDs__c: afterRemovedPulled.join() };
		if (primaryIsRemoved) {
			patchAgreementBody.Primary_Account_SID__c = null;
		}

		const updateAgreementReq = {
			url: agreement.attributes.url,
			method: "PATCH",
			body: patchAgreementBody,
			referenceId: "agreement",
		};

		reqArray.push(updateAgreementReq);

		const compositeRequestObject = {
			allOrNone: true,
			compositeRequest: reqArray,
		};

		await ajaxCallCompositePromise(sr, compositeRequestObject);
		setDefaultState();
		LoadComponentData();
	};

	const navToSID = (accountSIDId) => {
		var event = {
			name: "s1.navigateToSObject",
			payload: { recordId: accountSIDId },
		};
		publishEvent(sr, event);
	};

	const setPageData = (res) => {
		let data = res.compositeResponse;
		let agreementData = data[0].body;
		let agreementSIDData = data[1].body.records;
		let oppySidData = data[2].body.records[0].Opp_SID_SKUs__r.records;
		setAgreement(agreementData);
		let sortedAgreementSIDs = sortAgreementSIDs(agreementSIDData);
		setAgreementSIDs(sortedAgreementSIDs);

		let oppySidsNotInAgreement = removeAgreementSIDs(oppySidData, sortedAgreementSIDs);
		setOpportunitySIDs(oppySidsNotInAgreement);

		setLoading(false);
	};

	const associationHandler = (oppSID, adding) => {
		if (adding) {
			setSIDsToAssociate([oppSID, ...SIDsToAssociate]);
		} else {
			let updatedSIDsArray = SIDsToAssociate.filter((s) => s.Id !== oppSID.Id);
			setSIDsToAssociate(updatedSIDsArray);
		}
	};

	const disassociationHandler = (agreementSID, adding) => {
		if (adding) {
			setSIDsToDisassociate([agreementSID, ...SIDsToDisassociate]);
		} else {
			let updatedSIDsArray = SIDsToDisassociate.filter((s) => s.Id !== agreementSID.Id);
			setSIDsToDisassociate(updatedSIDsArray);
		}
	};

	const primaryChangeHandler = (agreementSID) => {
		setNewPrimarySID(agreementSID);
	};

	const savePrimaryHandler = () => {
		setLoading(true);
		let SIDName = newPrimarySID.Account_SID__r.Name;
		let updatedAdditionalSIDs = agreement.Additional_Account_SIDs__c.split(",")
			.filter((s) => s !== SIDName)
			.join();
		let patchAgreementBody = {
			Primary_Account_SID__c: SIDName,
			Additional_Account_SIDs__c: updatedAdditionalSIDs,
		};

		ajaxCall(sr, "PATCH", agreement.attributes.url, patchAgreementBody).then((data) => {
			setDefaultState();
			LoadComponentData();
		});
	};

	return (
		<article className="slds-card" ref={measuredRef}>
			{loading && (
				<div className="loader">
					<div role="status" className="slds-spinner slds-spinner_small">
						<span className="slds-assistive-text">Loading</span>
						<div className="slds-spinner__dot-a"></div>
						<div className="slds-spinner__dot-b"></div>
					</div>
				</div>
			)}
			<div className="slds-card__header slds-grid header">
				<header className="slds-media slds-media_center slds-has-flexi-truncate">
					<div className="slds-media__figure">
						<span
							className="slds-icon_container slds-icon-standard-account"
							title="account">
							<svg className="slds-icon" aria-hidden="true">
								<use href="/assets/icons/standard-sprite/svg/symbols.svg#topic"></use>
							</svg>
							<span className="slds-assistive-text">agreement SIDs</span>
						</span>
					</div>
					<div className="slds-media__body">
						<h2 className="slds-card__header-title">
							<a
								href="#"
								className="slds-card__header-link slds-truncate"
								title="Accounts">
								<span>Agreement SIDs ({agreementSIDs.length})</span>
							</a>
						</h2>
					</div>
					<HeaderOptions
						inLinkMode={inLinkMode}
						setInLinkMode={setInLinkMode}
						inPrimaryMode={inPrimaryMode}
						setInPrimaryMode={setInPrimaryMode}
						onSaveLinks={saveLinksHandler}
						onSavePrimary={savePrimaryHandler}
						noSIDs={agreementSIDs.length === 0}
					/>
				</header>
			</div>
			<div className="slds-card__body body">
				{agreementSIDs.length === 0 && sr && !inLinkMode && (
					<EmptyState loginUrl={sr.context.links.loginUrl} />
				)}
				{(agreementSIDs.length > 0 || inLinkMode) && (
					<ul role="grid" aria-label="SIDs on Agreement Table">
						{agreementSIDs.map((sid) => (
							<SIDItem
								key={sid.Id}
								sid={sid}
								navToSID={navToSID}
								inLinkMode={inLinkMode}
								onAssociationChange={associationHandler}
								onDisassociationChange={disassociationHandler}
								onPrimaryChange={primaryChangeHandler}
								newPrimarySID={newPrimarySID}
								agreementCurrency={agreement.Currency_OF_Generate__c}
								inPrimaryMode={inPrimaryMode}></SIDItem>
						))}
						{showOpps &&
							opportunitySIDs.map((sid) => (
								<SIDItem
									key={sid.Id}
									sid={sid}
									navToSID={navToSID}
									inLinkMode={inLinkMode}
									agreementCurrency={agreement.Currency_OF_Generate__c}
									onAssociationChange={associationHandler}
									onDisassociationChange={disassociationHandler}></SIDItem>
							))}
					</ul>
				)}
			</div>
		</article>
	);
}

export default SIDSelector;
