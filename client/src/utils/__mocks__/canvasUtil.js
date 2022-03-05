import { Response as srResponse } from "../../mocks/sample_responses/signedResponse";
import sampleCanvasReq from "../../../sampleCanvasReq.json";
import ajaxCallCompositePromiseRes from "../../mocks/sample_responses/ajaxCallCompositePromiseResponse.json";
const ajaxCall = async (sr, method, url, body) => {
	return await Promise.resolve({ something: "something" });
};

// single get request, requires full url
const ajaxCallGET = async (sr, queryUrl) => {
	return await Promise.resolve({ something: "something" });
};

const ajaxCallCollectionPromise = async (sr, body) => {
	return await Promise.resolve({ something: "something" });
};
const ajaxCallCompositePromise = async (sr, body) => {
	return await Promise.resolve(ajaxCallCompositePromiseRes.payload);
};

const publishEvent = (sr, payload) => {};

const getRefreshSignedRequest = async () => {
	return await Promise.resolve(srResponse);
};

const resize = () => {
	return null;
};

const decode = () => {
	return signedRequestString;
};

const signedRequestString =
	'{"algorithm":"HMACSHA256","issuedAt":1294299664,"userId":"00574000000EK5PAAW","client":{"refreshToken":"5Aep861PZc0QFfNmSy18Qe3HJ7oVo2iR1F2CK5gqIGC.XEmieMD5iTOPUg2WnR_pKBT7LE24QgES5NpE1ZFh2rO","instanceId":"_:node_react_canvas:630:0:canvasapp","targetOrigin":"https://twlo--bendev.my.salesforce.com","instanceUrl":"https://twlo--bendev.my.salesforce.com","oauthToken":"00D740000004awT!AREAQKVa88Cu5KsZb4i_hYRybXFj4b50xlZxi.My3rp13FEh3tK1UTHzHWP2Hqa7gOpzUcTUnujeFKm2bFr9XOPmpS_Trv88"},"context":{"user":{"userId":"00574000000EK5PAAW","userName":"bfelda@twilio.com.bendev2","firstName":"Ben","lastName":"Felda","email":"bfelda@twilio.com","fullName":"Ben Felda","locale":"en_US","language":"en_US","timeZone":"America/Los_Angeles","profileId":"00e40000000vg2C","roleId":"00E400000013JuN","userType":"STANDARD","currencyISOCode":"USD","profilePhotoUrl":"https://twlo--bendev--c.documentforce.com/profilephoto/005/F","profileThumbnailUrl":"https://twlo--bendev--c.documentforce.com/profilephoto/005/T","siteUrl":null,"siteUrlPrefix":null,"networkId":null,"accessibilityModeEnabled":false,"isDefaultNetwork":true},"links":{"loginUrl":"https://twlo--bendev.my.salesforce.com","enterpriseUrl":"/services/Soap/c/54.0/00D740000004awT","metadataUrl":"/services/Soap/m/54.0/00D740000004awT","partnerUrl":"/services/Soap/u/54.0/00D740000004awT","restUrl":"/services/data/v54.0/","sobjectUrl":"/services/data/v54.0/sobjects/","searchUrl":"/services/data/v54.0/search/","queryUrl":"/services/data/v54.0/query/","recentItemsUrl":"/services/data/v54.0/recent/","chatterFeedsUrl":"/services/data/v31.0/chatter/feeds","chatterGroupsUrl":"/services/data/v54.0/chatter/groups","chatterUsersUrl":"/services/data/v54.0/chatter/users","chatterFeedItemsUrl":"/services/data/v31.0/chatter/feed-items","userUrl":"/00574000000EK5PAAW"},"application":{"name":"node-react-canvas","canvasUrl":"http://localhost:3000/sign","applicationId":"06P740000004CRb","version":"1.0","authType":"SIGNED_REQUEST","referenceId":"09H7400000000IK","options":[],"samlInitiationMethod":"None","namespace":"","isInstalledPersonalApp":false,"developerName":"node_react_canvas"},"environment":{"referer":null,"locationUrl":"https://twlo--bendev.lightning.force.com/lightning/r/Apttus__APTS_Agreement__c/a3I7400000000epEAA/view","displayLocation":"Aura","sublocation":null,"uiTheme":"Theme3","dimensions":{"width":"100%","height":"900px","maxWidth":"1000px","maxHeight":"2000px","clientWidth":"1004px","clientHeight":"395px"},"parameters":{"recordId":"a3I7400000000epEAA","recordType":""},"record":{},"version":{"season":"SPRING","api":"54.0"}},"organization":{"organizationId":"00D740000004awTEAQ","name":"Twilio","multicurrencyEnabled":false,"namespacePrefix":null,"currencyIsoCode":"USD"}}}';

export {
	resize,
	decode,
	ajaxCall,
	ajaxCallGET,
	ajaxCallCollectionPromise,
	ajaxCallCompositePromise,
	publishEvent,
	getRefreshSignedRequest,
};
