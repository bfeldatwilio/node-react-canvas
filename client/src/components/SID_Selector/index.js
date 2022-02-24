import React, { useEffect, useState, useCallback } from "react";
import "@salesforce/canvas-js-sdk";
import "./SID_Selector.css";
import {
	getRefreshSignedRequest,
	ajaxCallCompositePromise,
	publishEvent,
	ajaxCall,
} from "../../utils/canvasUtil";
import {
	removeAgreementSIDs,
	agreementSidSOQL,
	sortAgreementSIDs,
	opportunitySIDSKUSOQL,
	additAgreementSIDs,
	createAgreementSIDRequest,
} from "./SID_Selector_Helper";
import SID_Item from "./SID_Item";
import Header_Options from "./headerOptions";

function SID_Selector() {
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
					global.Sfdc.canvas.client.resize(sr.client, {
						height: Math.ceil(nodeHeight) + "px",
					});
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
			let signedRequest = global.Sfdc.canvas.decode(part);
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
				`Apttus__APTS_Agreement__c/${recordId}?fields=Id, Related_Opportunity_APTS__c, Primary_Account_SID__c, Flex_Account_SID__c, Additional_Account_SIDs__c, Payment_Type__c, Name, Account_Legal_Name__c`,
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

		ajaxCallCompositePromise(sr, compositeRequestObj).then((res) => {
			setPageData(res);
		});
	};

	const saveLinksHandler = () => {
		setLoading(true);

		///services/data/vXX.X/composite/sobjects
		const batchUrl =
			"/services/data/v" + sr.context.environment.version.api + "/composite/sobjects";

		let reqArray = [];
		let SIDsToDisassociateNameArr = SIDsToDisassociate.map((s) => s.Account_SID__r.Name);

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

		const updateAgreementReq = {
			url: agreement.attributes.url,
			method: "PATCH",
			body: patchAgreementBody,
			referenceId: "agreement",
		};

		reqArray.push(updateAgreementReq);

		console.log(reqArray);

		const compositeRequestObject = {
			allOrNone: true,
			compositeRequest: reqArray,
		};

		ajaxCallCompositePromise(sr, compositeRequestObject).then((res) => {
			setDefaultState();
			LoadComponentData();
		});
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
		let patchAgreementBody = {
			Primary_Account_SID__c: newPrimarySID.Account_SID__r.Name,
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
					<Header_Options
						inLinkMode={inLinkMode}
						setInLinkMode={setInLinkMode}
						inPrimaryMode={inPrimaryMode}
						setInPrimaryMode={setInPrimaryMode}
						onSaveLinks={saveLinksHandler}
						onSavePrimary={savePrimaryHandler}
					/>
				</header>
			</div>
			<div className="slds-card__body body">
				<table
					className="slds-table slds-no-row-hover slds-table_cell-buffer"
					role="grid"
					aria-label="SIDs on Agreement Table">
					<tbody>
						{agreementSIDs.map((sid) => (
							<SID_Item
								key={sid.Id}
								sid={sid}
								navToSID={navToSID}
								inLinkMode={inLinkMode}
								onAssociationChange={associationHandler}
								onDisassociationChange={disassociationHandler}
								onPrimaryChange={primaryChangeHandler}
								inPrimaryMode={inPrimaryMode}></SID_Item>
						))}
						{showOpps &&
							opportunitySIDs.map((sid) => (
								<SID_Item
									key={sid.Id}
									sid={sid}
									navToSID={navToSID}
									inLinkMode={inLinkMode}
									onAssociationChange={associationHandler}
									onDisassociationChange={disassociationHandler}></SID_Item>
							))}
					</tbody>
				</table>
			</div>
		</article>
	);
}

export default SID_Selector;
