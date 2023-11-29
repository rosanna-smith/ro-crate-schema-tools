all: base 

base:
	rocsoss   -b  -p base-profile.json  -n "All inclusive RO-Crate Profile" -d "Profile that contains all of Schema.org + RO-Crate base vocab. Profile that contains all of Schema.org + RO-Crate base vocab. This is the default profile for Crate-O -- start here for exploring the tool"

idn:
	rocsoss test_data/idn/catalog/ro-crate-metadata.json -p test_data/idn/catalog/idn-catalog-profile.json -d "Work in progress collection profile for the Indigenous Data Network (IDN)" -n "Test ONLY: IDN collection profile"
	rocs ss test_data/idn/catalog/ro-crate-metadata.json -p test_data/idn/record/idn-record-profile.json -d "Work in progress collection profile for the Indigenous Data Network (IDN)" -n "Test ONLY: IDN collection profile"

cooee:
	node rocsoss.js test_data/ldac_examples/cooee/ro-crate-metadata.json -p "test-ldac-cooee-mode.json" -n "testldac cooee" -d "testing a mode file made with cooee" -s test_data/ldac-soss/ro-crate-metadata.json -o test-ldac-soss.json

ldac:
	node rocsoss.js  -p "test-ldac-cooee-mode.json" -n "testldac cooee" -d "testing a mode file made with cooee" -s test_data/ldac-soss/ro-crate-metadata.json  -o test-ldac-soss.json
