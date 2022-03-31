const removeAgreementSIDs = (oppySidRecords, agreementSIDRecords) => {
	let agreementSID_IDArray = agreementSIDRecords.map((sid) => sid.Account_SID__r.Id); //array of agreement SIDs [SID_Id, SID_Id...]

	let filteredOppySids = oppySidRecords.filter(
		(oppysid) => !agreementSID_IDArray.includes(oppysid.Account_SID__r.Id)
	); // Opportunity SIDS records minus those already in the agreement
	return filteredOppySids;
};

const additAgreementSIDs = (agreementSIDs) => {
	let agreementSIDNotPrimary = agreementSIDs.filter((sid) => !sid.Is_Primary_Account_SID__c);
	let agreementSIDNotFlexOrPrimary = agreementSIDNotPrimary.filter(
		(sid) => !sid.Is_Flex_Account_SID__c
	);
	return agreementSIDNotFlexOrPrimary.map((sid) => sid.Account_SID__r.Name);
};

const sortAgreementSIDs = (agreementSIDs) => {
	let primaryActionSIDs = agreementSIDs.filter((sid) => sid.Is_Primary_Account_SID__c);
	let flexActionSIDs = agreementSIDs.filter((sid) => sid.Is_Flex_Account_SID__c);
	let nonFlexOrPrimarySIDs = agreementSIDs.filter((sid) => {
		return !sid.Is_Primary_Account_SID__c && !sid.Is_Flex_Account_SID__c;
	});
	return [...primaryActionSIDs, ...flexActionSIDs, ...nonFlexOrPrimarySIDs];
};

const createAgreementSIDRequest = (SIDsToAssociate, agreementId, url) => {
	let addAgreementSIDRecords = SIDsToAssociate.map((agreementSID) => {
		return {
			attributes: { type: "Agreement_SID__c" },
			Agreement__c: agreementId,
			Account_SID__c: agreementSID.Account_SID__r.Id,
		};
	});
	let createAgreementSidBody = {
		allOrNone: false,
		records: addAgreementSIDRecords,
	};

	return {
		url: url,
		method: "POST",
		referenceId: "addAgreementSids",
		body: createAgreementSidBody,
	};
};

const opportunitySIDSKUSOQL = () => {
	const soqlString = `SELECT Id, Name, (SELECT Id,
		Account_SID__r.Id,
		Account_SID__r.Name,
		Account_SID__r.Software_MRR__c,
		Account_SID__r.Total_MRR__c,
		Account_SID__r.New_Business_Opportunity__c,
		Account_SID__r.Exception_Opportunity__c,
		Account_SID__r.NPC_Date_50__c,
		Account_SID__r.Account_SID_Created_Date__c,
		Account_SID__r.Account_SID_Status__c,
		Account_SID__r.Account_SID_Type__c,
		Account_SID__r.Account__r.Id,
		Account_SID__r.sid_Entity__c,
		Account_SID__r.Flex_Account__c,
		Account_SID__r.Customer_currency__c
		FROM Opp_SID_SKUs__r
		WHERE IsDeleted = false) 
		FROM Opportunity 
		WHERE Id = '@{agreement.Related_Opportunity_APTS__c}'`;

	// SOQL through query API requires form encoding and is passed through query parameter
	return soqlString.replace(/ /g, "+");
};

const agreementSidSOQL = () => {
	let soqlString = `SELECT Id,
	Is_Primary_Account_SID__c,
	Is_Flex_Account_SID__c,
	Account_SID__r.Id,
	Account_SID__r.Name,
	Account_SID__r.Software_MRR__c,
	Account_SID__r.Total_MRR__c,
	Account_SID__r.New_Business_Opportunity__c,
	Account_SID__r.Exception_Opportunity__c,
	Account_SID__r.NPC_Date_50__c,
	Account_SID__r.Account_SID_Created_Date__c,
	Account_SID__r.Account_SID_Status__c,
	Account_SID__r.Account_SID_Type__c,
	Account_SID__r.Account__r.Id,
	Account_SID__r.sid_Entity__c,
	Account_SID__r.Flex_Account__c,
	Account_SID__r.Customer_currency__c
	FROM Agreement_SID__c
	WHERE Agreement__r.Related_Opportunity_APTS__c = '@{agreement.Related_Opportunity_APTS__c}'
	and Agreement__r.Id= '@{agreement.Id}'`;

	// SOQL through query API requires form encoding and is passed through query parameter
	return soqlString.replace(/ /g, "+");
};

export {
	removeAgreementSIDs,
	sortAgreementSIDs,
	agreementSidSOQL,
	opportunitySIDSKUSOQL,
	additAgreementSIDs,
	createAgreementSIDRequest,
};
