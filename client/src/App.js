import React, { useEffect, useState, useCallback } from "react";
import { ajaxCallPromise, getRefreshSignedRequest } from "./canvasUtil";
import "@salesforce/canvas-js-sdk";
import "./App.css";

function App() {
	// example SOQL queries
	// let SOQLquery = `SELECT Id, Name, (SELECT Id, Name, Account_SID_Friendly_Name__c FROM Agreement_SID__c) FROM Agreement
	// WHERE Id = "${recordId}"`;
	// let SOQLquery2 = serialize({ query: `SELECT Id, Name FROM Account` });

	const [agreement, setAgreement] = useState();
	const [recordId, setRecordId] = useState();
	const [user, setUser] = useState();
	const [sr, setSr] = useState();

	useEffect(() => {
		console.log("First Call!!!!!!!!!!!");
		populateSignedRequest();
	}, []);

	useEffect(() => {
		if (recordId) {
			console.log("2nd Call Use Effect after Record Set", recordId);
			fetchAndSetAgreement(recordId);
		}
	}, [recordId]);

	useEffect(() => {
		if (agreement) {
			console.log(
				"3rd Call, Use Effect from Agreement Set",
				agreement.Name
			);
			fetchSoql();
		}
	}, [agreement]);

	const measuredRef = useCallback(
		(node) => {
			if (node !== null) {
				if (sr) {
					let nodeHeight = node.getBoundingClientRect().height;
					if (window) {
						global.Sfdc.canvas.client.resize(sr.client, {
							height: Math.ceil(nodeHeight) + "px",
						});
					}
				}
			}
		},
		[agreement]
	);

	const fetchSoql = async () => {
		let soql = `SELECT Id, Name, (SELECT Id, Name, Account_SID_Friendly_Name__c FROM Agreement_SID__c) FROM Apttus__APTS_Agreement__c WHERE Id = "${recordId}"`;
		let url = sr.context.links.queryUrl + "?q=SELECT+name+from+Account";
		ajaxCallPromise(sr.client, url).then((data) => {
			console.log(data);
		});
	};

	const fetchAndSetAgreement = async (recordId) => {
		var restUrl =
			sr.context?.links?.sobjectUrl +
			`Apttus__APTS_Agreement__c/${recordId}`;
		try {
			ajaxCallPromise(sr.client, restUrl).then((data) => {
				setAgreement(data);
			});
		} catch (e) {
			console.log("Error!!!!!!!!!!!!!!!!!!!!", e);
		}
	};

	const populateSignedRequest = () => {
		getRefreshSignedRequest().then((data) => {
			let payload = data.payload.response;
			let part = payload.split(".")[1];
			let signedRequest = global.Sfdc.canvas.decode(part);
			let signedRequestJSON = JSON.parse(signedRequest);
			setSr(signedRequestJSON);
			setUser(signedRequestJSON.context.user);
			setRecordId(
				signedRequestJSON.context.environment.parameters.recordId
			);
		});
	};

	return (
		<article className="tile-container" ref={measuredRef}>
			<div className="gradient-bg morning-gradient"></div>
			<div className="icon-overlay heart-svg"></div>
			<div className="tile-content">
				<h1>React</h1>
				<p>{user?.fullName}</p>
				<p>{agreement?.Account_Legal_Name__c}</p>
				<p>{agreement?.Name}</p>
			</div>
		</article>
	);
}

export default App;
