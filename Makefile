base:
	rocsoss   -b  -p base-profile.json  -n "All inclusive schema.org + RO-Crate add-ins  profile for RO-Crate"

generic: 
	rocsoss  sample/ro-crate-metadata.json   -p generic-profile.json -n "Generic RO-Crate Profile" -d "General purpose RO-Crate profile to add things that are not in this profile, switch the all-inclusive base-profile and then switch back"