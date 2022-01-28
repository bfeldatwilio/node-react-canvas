import React, { useEffect, useState } from "react";
import { ajaxCallPromise, getRefreshSignedRequest } from "./canvasUtil";
import "@salesforce/canvas-js-sdk";
import "./App.css";

function App() {
	// example SOQL queries
	// let SOQLquery = `SELECT Id, Name, (SELECT Id, Name, Account_SID_Friendly_Name__c FROM Agreement_SID__c) FROM Agreement
	// WHERE Id = "${recordId}"`;
	// let SOQLquery2 = serialize({ query: `SELECT Id, Name FROM Account` });

	const [data, setData] = useState(null);
	const [agreement, setAgreement] = useState({});
	const [recordId, setRecordId] = useState(null);
	const [user, setUser] = useState({});
	const [sr, setSr] = useState({});

	async function fetchAndSetAgreement(recordId) {
		var restUrl =
			sr.context.links.sobjectUrl +
			`Apttus__APTS_Agreement__c/${recordId}`;
		try {
			await ajaxCallPromise(sr.client, restUrl).then((data) => {
				setAgreement(data);
			});
		} catch (e) {
			console.log("Error!!!!!!!!!!!!!!!!!!!!", e);
		}
	}

	const onclick = async (e) => {
		var restUrl =
			sr.context.links.sobjectUrl +
			`Apttus__APTS_Agreement__c/${recordId}`;
		try {
			await ajaxCallPromise(sr.client, restUrl).then((data) => {
				setAgreement(data);
			});
		} catch (e) {
			console.log("Error!!!!!!!!!!!!!!!!!!!!", e);
		}
	};

	const populateSignedRequest = () => {
		getRefreshSignedRequest().then((data) => {
			console.log(data);
			let payload = data.payload.response;
			let part = payload.split(".")[1];
			let signedRequest = global.Sfdc.canvas.decode(part);
			let signedRequestJSON = JSON.parse(signedRequest);
			setRecordId(
				signedRequestJSON.context.environment.parameters.recordId
			);
			setSr(signedRequestJSON);
			setUser(signedRequestJSON.context.user);
		});
	};

	useEffect(() => {
		if (sr.context) {
			fetchAndSetAgreement(sr.context.environment.parameters.recordId);
		}
	}, [sr]);

	useEffect(() => {
		populateSignedRequest();
		fetch("/api")
			.then((res) => res.json())
			.then((data) => {
				console.log(data.message);
				setData(data.message);
			});
	}, []);

	return (
		<div className="App">
			<header className="App-header">
				<p>{!user.userName ? "Loading..." : user.fullName}</p>
				<p>{agreement.Account_Legal_Name__c}</p>
				<p>{agreement.Name}</p>
				<button onClick={onclick}>Test</button>
			</header>
		</div>
	);
}

export default App;
