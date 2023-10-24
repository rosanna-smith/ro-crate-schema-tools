all: base 

base:
	rocsoss   -b  -p base-profile.json  -n "All inclusive RO-Crate Profile" -d "Profile that contains all of Schema.org + RO-Crate base vocab. Profile that contains all of Schema.org + RO-Crate base vocab. This is the default profile for Crate-O -- start here for exploring the tool"

idn:
	rocsoss test_data/idn/catalog/ro-crate-metadata.json -p test_data/idn/catalog/idn-catalog-profile.json -d "Work in progress collection profile for the Indigenous Data Network (IDN)" -n "Test ONLY: IDN collection profile"
	rocsoss test_data/idn/catalog/ro-crate-metadata.json -p test_data/idn/record/idn-record-profile.json -d "Work in progress collection profile for the Indigenous Data Network (IDN)" -n "Test ONLY: IDN collection profile"

