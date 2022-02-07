import React, { useEffect, useState } from "react";
import { ajaxCallPromise, getRefreshSignedRequest } from "./canvasUtil";
import "@salesforce/canvas-js-sdk";
import "./App.css";

function App() {
	// example SOQL queries
	// let SOQLquery = `SELECT Id, Name, (SELECT Id, Name, Account_SID_Friendly_Name__c FROM Agreement_SID__c) FROM Agreement
	// WHERE Id = "${recordId}"`;
	// let SOQLquery2 = serialize({ query: `SELECT Id, Name FROM Account` });

	const [agreement, setAgreement] = useState({});
	const [recordId, setRecordId] = useState(null);
	const [user, setUser] = useState({});
	const [sr, setSr] = useState({});

	async function fetchAndSetAgreement(recordId) {
		var restUrl =
			sr.context.links.sobjectUrl +
			`Apttus__APTS_Agreement__c/${recordId}`;
		try {
			ajaxCallPromise(sr.client, restUrl).then((data) => {
				setAgreement(data);
			});
		} catch (e) {
			console.log("Error!!!!!!!!!!!!!!!!!!!!", e);
		}
	}

	const populateSignedRequest = () => {
		getRefreshSignedRequest().then((data) => {
			let payload = data.payload.response;
			let part = payload.split(".")[1];
			let signedRequest = global.Sfdc.canvas.decode(part);
			let signedRequestJSON = JSON.parse(signedRequest);
			setSr(signedRequestJSON);
			setRecordId(
				signedRequestJSON.context.environment.parameters.recordId
			);
			setUser(signedRequestJSON.context.user);
		});
	};

	useEffect(() => {
		fetchAndSetAgreement(recordId);
	}, [recordId]);

	useEffect(() => {
		populateSignedRequest();
	}, []);

	return (
		<article className="tile-container">
			<div className="gradient-bg morning-gradient"></div>
			<div className="icon-overlay heart-svg"></div>
			<div className="tile-content">
				<h1>React</h1>
				<p>{user.fullName}</p>
				<p>{agreement.Account_Legal_Name__c}</p>
				<p>{agreement.Name}</p>
			</div>
		</article>
	);
}

export default App;
