/*
props:
	sid, AgreementSID passed in from the parent
	unlinkSID, function passed in to call to unlink
*/

export default function SID_Item(props) {
	const sid = props.sid;
	const onCheckChange = (e) => {
		let adding = e.target.checked;
		if (adding) {
		} else {
			props.unlinkSID(props.sid);
		}
	};

	return (
		<li key={sid.Id}>
			<div className="checkbox">
				<input
					type="checkbox"
					className="opacityzero"
					id={sid.Id + "_cb"}
					onChange={onCheckChange}
					defaultChecked
				/>
				<label className="inlinebox" htmlFor={sid.Id + "_cb"}>
					{sid.Account_SID__r.Name}
					{sid.Is_Flex_Account_SID__c ? "| Flex" : ""}
					{sid.Is_Primary_Account_SID__c ? " | Primary" : ""}
				</label>
			</div>
		</li>
	);
}
