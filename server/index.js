const express = require("express");
const res = require("express/lib/response");
const path = require("path");
const decode = require("salesforce-signed-request");
const jsforce = require("jsforce");
const signedRequestConsumerSecret = process.env.SIGNED_REQUEST_CONSUMER_SECRET;

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("/api", (req, res) => {
	console.log("inside the api request");
	res.json({ message: "Hello from the server!" });
});

app.post("/canvasdemo", (req, res) => {
	console.log("!!!!!!!!!!!!!!!!!!!Signed Request");
	var signedrequest = decode(
		req.body.signed_request,
		signedRequestConsumerSecret
	);

	console.log("Decoded Signed Request: ", signedrequest);
	res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.get("/oauth/wsf/callback", function (req, res) {
	console.log("oauth wsf callback", req.body, req.params, req.query);
	var conn = new jsforce.Connection({ oauth2: oauth2 });
	var code = req.query.code;
	conn.authorize(code, function (err, userInfo) {
		if (err) {
			return console.error(err);
		}
		console.log("authorize response", conn, userInfo);
		res.render("oauth2", { conn: conn });
	});
});

// app.get("*", (req, res) => {
// 	res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
// });

app.listen(PORT, () => {
	console.log("Server listening on " + PORT);
});
