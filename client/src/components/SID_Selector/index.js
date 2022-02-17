import React, { useEffect, useState, useCallback } from "react";
import "@salesforce/canvas-js-sdk";
import {
	ajaxCallPromise,
	getRefreshSignedRequest,
	ajaxCallCompositePromise,
} from "../../utils/canvasUtil";
import {
	removeAgreementSidsFromOppySids,
	convertOppySids,
	agreementSidSOQL,
	sortAgreementSIDs,
	opportunitySIDSKUSOQL,
} from "./SID_Selector_Helper";
import "./SID_Selector.css";
import SID_Item from "./SID_Item";

function SID_Selector() {
	const [loading, setLoading] = useState(true);
	const [sr, setSr] = useState();
	const [recordId, setRecordId] = useState();
	const [agreement, setAgreement] = useState();
	// Sids on the agreement and oppy
	// AccountSidWrapper objects
	const [agreementSIDs, setAgreementSIDs] = useState([]);
	// Sids on the oppy
	// Straight up SIDs
	const [oppySids, setOppySids] = useState([]);

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
			setRecordId(
				signedRequestJSON.context.environment.parameters.recordId
			);
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

		const oppySoqlUrl =
			sr.context.links.queryUrl + "?q=" + opportunitySIDSKUSOQL();
		const oppySIDRequest = {
			url: oppySoqlUrl,
			method: "GET",
			referenceId: "oppySid",
		};

		// format required by SF Composite API
		const compositeRequestObj = {
			compositeRequest: [
				agreementRequest,
				agreementSIDRequest,
				oppySIDRequest,
			],
		};

		ajaxCallCompositePromise(sr, compositeRequestObj).then((res) => {
			setPageData(res);
		});
	};

	const linkSID = (sid) => {};

	const unlinkSID = (sid) => {
		setLoading(true);
		let deleteAgreementSIDReq = {
			url: sid.attributes.url,
			method: "DELETE",
			referenceId: "agreementSid",
		};
		let reqArray = [deleteAgreementSIDReq];

		let agreementPrimaryOrFlexUpdate =
			sid.Is_Flex_Account_SID__c || sid.Is_Primary_Account_SID__c;

		if (agreementPrimaryOrFlexUpdate) {
			let patchAgreementBody = {};
			if (sid.Is_Primary_Account_SID__c) {
				patchAgreementBody.Primary_Account_SID__c = null;
			}

			if (sid.Is_Flex_Account_SID__c) {
				patchAgreementBody.Is_Primary_Account_SID__c = null;
			}
			let updateAgreementReq = {
				url: agreement.attributes.url,
				method: "PATCH",
				body: patchAgreementBody,
				referenceId: "agreement",
			};
			reqArray.push(updateAgreementReq);
		}

		const compositeRequestObject = {
			allOrNone: agreementPrimaryOrFlexUpdate,
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
		let oppySidData = data[2].body.records;
		setAgreement(agreementData);

		// remove agreement SIDS from the Opportunity list
		let dedupedOppySids = removeAgreementSidsFromOppySids(
			oppySidData[0].Opp_SID_SKUs__r.records,
			agreementSIDData
		);
		// convert the opportunity SID into the wrapper
		let convertedOppySids = convertOppySids(dedupedOppySids);
		setOppySids(convertedOppySids);

		let sortedAgreementSIDs = sortAgreementSIDs(agreementSIDData);
		setAgreementSIDs(sortedAgreementSIDs);
		setLoading(false);
	};

	const onCheckChange = (e) => {
		let adding = e.target.checked;
		console.log(adding);
	};

	return (
		<article className="tile-container" ref={measuredRef}>
			<div className={`loader ${loading ? "active" : ""}`}></div>
			<div className="gradient-bg blue-gradient"></div>
			<div className="icon-overlay circle-svg"></div>
			<div className="tile-content">
				<h1>React Canvas</h1>
				<hr />
				<h3>Agreement Info</h3>
				<p>{agreement?.Account_Legal_Name__c}</p>
				<p>{agreement?.Name}</p>
				<p>{agreement?.Primary_Account_SID__c}</p>
				<hr />
				<h3>SIDs</h3>
				<ul className="list-unstyled">
					{agreementSIDs.map((sid) => (
						<SID_Item
							key={sid.Id}
							sid={sid}
							unlinkSID={unlinkSID}
							agreement={agreement}></SID_Item>
					))}
					{oppySids.map((osid) => (
						<li key={osid.Account_SID_Id}>
							<div className="checkbox">
								<input
									type="checkbox"
									className="opacityzero"
									id={osid.Account_SID_Id + "_cb"}
									onChange={onCheckChange}
								/>
								<label
									className="inlinebox"
									htmlFor={osid.Account_SID_Id + "_cb"}>
									{osid.Account_SID_Name}
								</label>
							</div>
						</li>
					))}
				</ul>
			</div>
		</article>
	);
}

export default SID_Selector;
