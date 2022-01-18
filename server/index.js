const express = require("express");
const res = require("express/lib/response");
const path = require("path");
const decode = require("salesforce-signed-request");
const jsforce = require("jsforce");
const sftools = require("./sf-tools");
const signedRequestConsumerSecret = process.env.SIGNED_REQUEST_CONSUMER_SECRET;

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static(path.resolve(__dirname, "../client/public")));

app.get("/api", (req, res) => {
	console.log("inside the api request");
	res.json({ message: "Hello from the server!" });
});

app.get("/", (req, res) => {
	res.render(path.resolve(__dirname, "../client/public", "index.html"));
});

app.get("/", function (req, res) {
	//get the canvas details from session (if any)
	var canvasDetails = sftools.getCanvasDetails(req);
	console.log(
		"__________________________Base Get______________________________"
	);
	console.log("Details: ", canvasDetails);
	//the page knows if the user is logged into SF
	res.render(path.resolve(__dirname, "../client/public", "index.html"));
	// res.render('index',{canvasDetails : canvasDetails});
});

app.post("/canvasdemo", (req, res) => {
	sftools.canvasCallback(
		req.body,
		SF_CANVASAPP_CLIENT_SECRET,
		function (error, canvasRequest) {
			if (error) {
				res.statusCode = 400;
				return res.render("error", { error: error });
			}
			//saves the token details into session
			sftools.saveCanvasDetailsInSession(req, canvasRequest);
			return res.redirect("/");
		}
	);

	// console.log("Decoded Signed Request: ", signedrequest);
	// res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
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

// app.get("*", (req, res) => {
// 	res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
// });

app.listen(PORT, () => {
	console.log("Server listening on " + PORT);
});
