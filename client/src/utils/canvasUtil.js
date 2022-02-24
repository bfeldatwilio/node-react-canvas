const ajaxCall = async (sr, method, url, body) => {
	let promise = await new Promise((resolve, reject) => {
		global.Sfdc.canvas.client.ajax(url, {
			client: sr.client,
			method: method,
			data: JSON.stringify(body),
			success: function (data) {
				if (data.status === 200 || data.status === 204) {
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

// single get request, requires full url
const ajaxCallGET = async (sr, queryUrl) => {
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

// https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_sobjects_collections_create.htm
const ajaxCallBatchPromise = async (sr, body) => {
	const batchUrl =
		sr.client.instanceUrl +
		"/services/data/v" +
		sr.context.environment.version.api +
		"/composite/sobjects";

	let promise = await new Promise((resolve, reject) => {
		global.Sfdc.canvas.client.ajax(batchUrl, {
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

// https://developer.salesforce.com/docs/atlas.en-us.platform_connect.meta/platform_connect/canvas_app_event_publish_code_example.htm
// https://developer.salesforce.com/docs/atlas.en-us.224.0.platform_connect.meta/platform_connect/canvas_apps_salesforce1_navigation_methods.htm
const publishEvent = (sr, payload) => {
	global.Sfdc.canvas.client.publish(sr.client, payload);
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
	ajaxCall,
	ajaxCallGET,
	ajaxCallBatchPromise,
	ajaxCallCompositePromise,
	publishEvent,
	getRefreshSignedRequest,
	getCurrentContext,
};
