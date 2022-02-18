import React, { useEffect, useState, useCallback } from "react";
import "@salesforce/canvas-js-sdk";
import {
	ajaxCallPromise,
	getRefreshSignedRequest,
	ajaxCallCompositePromise,
} from "../../utils/canvasUtil";
import {
	mergeSIDS,
	convertOppySids,
	agreementSidSOQL,
	sortAgreementSIDs,
	opportunitySIDSKUSOQL,
	additAgreementSIDs,
} from "./SID_Selector_Helper";
import "./SID_Selector.css";
import SID_Item from "./SID_Item";

function SID_Selector() {
	const [loading, setLoading] = useState(true);
	const [sr, setSr] = useState();
	const [recordId, setRecordId] = useState();
	const [agreement, setAgreement] = useState();
	const [SIDs, setSIDs] = useState([]);

	useEffect(() => {
		populateSignedRequest();
	}, []);

	useEffect(() => {
		if (recordId) {
			LoadComponentData();
		}
	}, [recordId]);

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
		[SIDs]
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

	const linkSID = (oppSid, isPrimary, isFlex) => {
		//if agreement already has a primary, throw error until they remove it

		setLoading(true);
		let createAgreementSidBody = {
			Agreement__c: agreement.Id,
			Account_SID__c: oppSid.Account_SID__r.Id,
		};
		let createAgreementSIDReq = {
			url: sr.context.links.sobjectUrl + "Agreement_SID__c",
			method: "POST",
			referenceId: "agreementSid",
			body: createAgreementSidBody,
		};
		let reqArray = [createAgreementSIDReq];

		// Create the patch for the agreement.
		// Agreement has a field for Primary SID Name, FLEX SID Name, and a list of Additional SID Names
		let patchAgreementBody = {};
		if (isPrimary) {
			patchAgreementBody.Primary_Account_SID__c = oppSid.Account_SID__r.Name;
		} else if (isFlex) {
			patchAgreementBody.Flex_Account_SID__c = oppSid.Account_SID__r.Name;
		} else {
			let allAdditionalSIDs = additAgreementSIDs(oppSid, SIDs);
			allAdditionalSIDs.push(oppSid.Account_SID__r.Name);
			patchAgreementBody.Additional_Account_SIDs__c = allAdditionalSIDs.join();
		}
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
			LoadComponentData();
			console.log(res);
		});
	};

	const unlinkSID = (agreementSid) => {
		setLoading(true);
		let deleteAgreementSIDReq = {
			url: agreementSid.attributes.url,
			method: "DELETE",
			referenceId: "agreementSid",
		};
		let reqArray = [deleteAgreementSIDReq];

		let patchAgreementBody = {};
		if (agreementSid.Is_Primary_Account_SID__c) {
			patchAgreementBody.Primary_Account_SID__c = null;
		} else if (agreementSid.Is_Flex_Account_SID__c) {
			patchAgreementBody.Flex_Account_SID__c = null;
		} else {
			let allAdditionalSIDs = additAgreementSIDs(agreementSid, SIDs).filter(
				(s) => s !== agreementSid.Account_SID__r.Name
			);
			patchAgreementBody.Additional_Account_SIDs__c = allAdditionalSIDs.join();
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

		ajaxCallCompositePromise(sr, compositeRequestObject).then((res) => {
			LoadComponentData();
		});
	};

	const setPageData = (res) => {
		let data = res.compositeResponse;

		let agreementData = data[0].body;
		let agreementSIDData = data[1].body.records;
		let oppySidData = data[2].body.records[0].Opp_SID_SKUs__r.records;
		setAgreement(agreementData);

		let sortedAgreementSIDs = sortAgreementSIDs(agreementSIDData);
		let mergedSIDs = mergeSIDS(oppySidData, sortedAgreementSIDs);

		setSIDs(mergedSIDs);
		console.log(agreementData);
		console.log(mergedSIDs);
		setLoading(false);
	};

	return (
		<article className="tile-container" ref={measuredRef}>
			<div className={`loader ${loading ? "active" : ""}`}></div>
			<div className="gradient-bg blue-gradient"></div>
			<div className="icon-overlay circle-svg"></div>
			<div className="tile-content">
				<h2>Agreement Info</h2>
				<p>{agreement?.Account_Legal_Name__c}</p>
				<p>{agreement?.Name}</p>
				<p>{agreement?.Primary_Account_SID__c}</p>
				<hr />
				<ul className="list-unstyled">
					{SIDs.map((sid) => (
						<SID_Item
							key={sid.Id}
							sid={sid}
							unlinkSID={unlinkSID}
							linkSID={linkSID}></SID_Item>
					))}
				</ul>
			</div>
		</article>
	);
}

export default SID_Selector;
