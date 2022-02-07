const express = require("express");
const path = require("path");
// const jsforce = require("jsforce");
// const sftools = require("./sf-tools");
// if (process.env.NODE_ENV !== "production") {
// 	require("dotenv").config();
// }
// const SF_CANVASAPP_CLIENT_SECRET =
// process.env.SIGNED_REQUEST_CONSUMER_SECRET;

const PORT = process.env.PORT || 3001;

const app = express();

// const cookieParser = require("cookie-parser");
const compression = require("compression");

// app.use(cookieParser());
app.use(express.json());
app.use(compression());
app.use(
	express.urlencoded({
		extended: true,
	})
);

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("/api", (req, res) => {
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

app.listen(PORT, () => {
	console.log("Server listening on " + PORT);
});
