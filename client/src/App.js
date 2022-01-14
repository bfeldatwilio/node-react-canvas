import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "@salesforce/canvas-js-sdk";
import "./App.css";

function App() {
	const [data, setData] = useState(null);
	const client = global.Sfdc.canvas.oauth.client();

	const callback = (msg) => {
		if (msg.status !== 200) {
			console.log("error", msg.status);
			return;
		}
		console.log("Payload____________________________");
		console.log(msg.payload);
	};

	const onclick = (e) => {
		console.log("clicked!!!!!!!!!!!!!!!!!!!!!");
		global.Sfdc.canvas.client.ctx(callback, client);
	};

	useEffect(() => {
		fetch("/api")
			.then((res) => res.json())
			.then((data) => {
				setData(data.message);
			});
	}, []);

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>{!data ? "Loading..." : data}</p>
			</header>
			<button onclick={onclick}>Test</button>
		</div>
	);
}

export default App;
