const ajaxCallPromise = async (sr, queryUrl) => {
	let promise = await new Promise((resolve, reject) => {
		global.Sfdc.canvas.client.ajax(queryUrl, {
			client: sr.client,
			success: function (data) {
				if (data.status === 200) {
					resolve(data.payload);
				} else {
					console.log("Not 200@!#$%@!#$%!#$%");
					console.log(data);
					reject(data.status);
				}
			},
		});
	});
	return promise;
};

// https://salesforce.stackexchange.com/questions/285996/getting-json-parser-error-when-using-sfdc-canvas-client-ajax-to-create-multiple
// https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_composite.htm

const ajaxCallCompositePromise = async (sr, body) => {
	const compositeUrl =
		sr.client.instanceUrl +
		"/services/data/v" +
		sr.context.environment.version.api +
		"/composite";

	let promise = await new Promise((resolve, reject) => {
		global.Sfdc.canvas.client.ajax(compositeUrl, {
			client: sr.client,
			method: "POST",
			data: JSON.stringify(body),
			success: function (data) {
				if (data.status === 200) {
					resolve(data.payload);
				} else {
					console.log("Not 200@!#$%@!#$%!#$%");
					console.log(data);
					reject(data.status);
				}
			},
			error: function (error) {
				console.log(error);
			},
		});
	});
	return promise;
};

const getRefreshSignedRequest = async () => {
	let promise = await new Promise((resolve, reject) => {
		global.Sfdc.canvas.client.refreshSignedRequest(function (data) {
			if (data.status === 200) {
				resolve(data);
			} else {
				reject(data);
			}
		});
	});
	return promise;
};

const getCurrentContext = async (client) => {
	let promise = await new Promise((resolve, reject) => {
		global.Sfdc.canvas.client.ctx((msg) => {
			if (msg.status !== 200) reject(msg);
			resolve(msg.payload);
		}, client);
	});
	return promise;
};

export {
	ajaxCallPromise,
	getRefreshSignedRequest,
	getCurrentContext,
	ajaxCallCompositePromise,
};
