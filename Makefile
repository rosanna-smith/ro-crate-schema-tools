all: base generic

base:
	rocsoss   -b  -p base-profile.json  -n "All inclusive RO-Crate Profile" -d "Profile that contains all of Schema.org + RO-Crate base vocab. This is not intended for general use, but can be used to add in a class or property that is not supported in a more specific profile"

generic: 
	rocsoss  sample/ro-crate-metadata.json   -p generic-profile.json -n "Generic RO-Crate Profile" -d "General purpose RO-Crate profile to add things that are not in this profile, switch the all-inclusive base-profile and then switch back"