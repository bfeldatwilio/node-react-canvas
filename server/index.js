const express = require("express");
const path = require("path");
// const jsforce = require("jsforce");
// const sftools = require("./sf-tools");
// if (process.env.NODE_ENV !== "production") {
// 	require("dotenv").config();
// }
// const SF_CANVASAPP_CLIENT_SECRET =
// process.env.SIGNED_REQUEST_CONSUMER_SECRET ||
// "F7469B2D660947F3307E3C5CD57C626EB74A68B401580B4E4B5D908A2B43E465";

const PORT = process.env.PORT || 3001;

const app = express();

// const cookieParser = require("cookie-parser");
// const compression = require("compression");

// app.use(cookieParser());
// app.use(express.json());
// app.use(compression());
// app.use(
// 	express.urlencoded({
// 		extended: true,
// 	})
// );

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("/api", (req, res) => {
	console.log("inside the api request");
	console.log("^^^^^^^^^^^^^^^ Detes ^^^^^^^^^^^^^^^^^^");

	console.log(req.session);
	res.json({ message: "Hello from the server!" });
});

app.get("/", (req, res) => {
	console.log("Request for root......................................");
	res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.post("/sign", (req, res) => {
	return res.redirect("/");
	// var sess = req.session;
	// sftools.canvasCallback(
	// 	req.body,
	// 	SF_CANVASAPP_CLIENT_SECRET,
	// 	function (error, canvasRequest) {
	// 		if (error) {
	// 			res.statusCode = 400;
	// 			console.log(error);
	// 			return res.redirect("/");
	// 		}

	// 		let username = canvasRequest.context.user.userName;
	// 		let recordType =
	// 			canvasRequest.context.environment.parameters.recordType;
	// 		let sr_client = canvasRequest.client;
	// 		let queryUrl = canvasRequest.context.links.queryUrl;
	// 		let instanceUrl = canvasRequest.client.instanceUrl;
	// 		sess.sr_client = sr_client;
	// 		sess.oauthToken = canvasRequest.client.oauthToken;

	// 		console.log("^^^ UserName ^^^ " + username);
	// 		console.log(
	// 			"************** Record Type ******************" + recordType
	// 		);
	// 		console.log(
	// 			"************** queryUrl ******************" + queryUrl
	// 		);
	// 		console.log(
	// 			"************** instanceUrl ******************" + instanceUrl
	// 		);
	// 		// console.log(
	// 		// 	"************** canvas request ******************" +
	// 		// 		JSON.stringify(canvasRequest, null, 4)
	// 		// );

	// 		sess.username = canvasRequest.context.user.userName;
	// 	}
	// );
});

// app.get("/oauth/wsf/callback", function (req, res) {
// 	console.log("oauth wsf callback", req.body, req.params, req.query);
// 	var conn = new jsforce.Connection({ oauth2: oauth2 });
// 	var code = req.query.code;
// 	conn.authorize(code, function (err, userInfo) {
// 		if (err) {
// 			return console.error(err);
// 		}
// 		console.log("authorize response", conn, userInfo);
// 		res.render("oauth2", { conn: conn });
// 	});
// });

app.listen(PORT, () => {
	console.log("Server listening on " + PORT);
});
