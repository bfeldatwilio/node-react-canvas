const express = require("express");
// const bodyParser = require("body-parser");
// const request = require("request");
const compression = require("compression");
const session = require("express-session");
// const res = require("express/lib/response");
const path = require("path");
// const decode = require("salesforce-signed-request");
// const jsforce = require("jsforce");
const sftools = require("./sf-tools");
if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
const SF_CANVASAPP_CLIENT_SECRET =
	process.env.SIGNED_REQUEST_CONSUMER_SECRET ||
	"F7469B2D660947F3307E3C5CD57C626EB74A68B401580B4E4B5D908A2B43E465";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(compression());
app.use(
	express.urlencoded({
		extended: true,
	})
);
const sess = {
	secret: "keyboard cat",
	cookie: {},
};

if (app.get("env") === "production") {
	app.set("trust proxy", 1); // trust first proxy
	sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("/api", (req, res) => {
	console.log("inside the api request");
	console.log(req.session);
	res.json({ message: "Hello from the server!" });
});

app.post("/canvasdemo", (req, res) => {
	sftools.canvasCallback(
		req.body,
		SF_CANVASAPP_CLIENT_SECRET,
		function (error, canvasRequest) {
			if (error) {
				res.statusCode = 400;
				console.log(error);
				return res.redirect("/");
			}
			//saves the token details into session
			sftools.saveCanvasDetailsInSession(req, canvasRequest);
			return res.redirect("/");
		}
	);
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
