const express = require("express");
const res = require("express/lib/response");
const path = require("path");
const decode = require("salesforece-signed-request");
const signedRequestConsumerSecret = process.env.SIGNED_REQUEST_CONSUMER_SECRET;

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("/api", (req, res) => {
	console.log("inside the api request");
	res.json({ message: "Hello from the server!" });
});

app.get("/canvasdemo", (req, res) => {
	console.log("!!!!!!!!!!!!!!!!!!!Signed Request");

	var signedrequest = decode(
		req.body.signed_request,
		signedRequestConsumerSecret
	);

	console.log("Decoded Signed Request: ", signedrequest);
	res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.get("*", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
	console.log("Server listening on " + PORT);
});
