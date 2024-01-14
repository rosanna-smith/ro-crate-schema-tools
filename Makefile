all: base 

base:
	node rocsoss.js   -b  -m base-mode.json  -n "All inclusive RO-Crate Profile" -d "Profile that contains all of Schema.org + RO-Crate base vocab. Profile that contains all of Schema.org + RO-Crate base vocab. This is the default profile for Crate-O -- start here for exploring the tool"

idn:
	node rocsoss.js test_data/idn/catalog/ro-crate-metadata.json -m test_data/idn/catalog/idn-catalog-mrofile.json -d "Work in progress collection profile for the Indigenous Data Network (IDN)" -n "Test ONLY: IDN collection profile"
	rocs ss test_data/idn/catalog/ro-crate-metadata.json -m test_data/idn/record/idn-record-mrofile.json -d "Work in progress collection profile for the Indigenous Data Network (IDN)" -n "Test ONLY: IDN collection profile"

cooee:
	node rocsoss.js test_data/ldac_examples/cooee/ro-crate-metadata.json -m "test-ldac-cooee-mode.json" -n "testldac cooee" -d "testing a mode file made with cooee" -s test_data/ldac-soss/ro-crate-metadata.json -o test-ldac-soss.json

#this doesnt work in make!!
with_mode:
    wget https://raw.githubusercontent.com/Language-Research-Technology/ro-crate-editor-mrofiles/15-multiple_roots/modes/language-data-commons.json
	node rocsoss.js test_data/ldac_examples/cooee/ro-crate-metadata.json -m "test-ldac-cooee-mode.json" -n "testldac cooee" -d "testing a mode file made with cooee" -s test_data/ldac-soss/ro-crate-metadata.json -o test-ldac-soss.json -e language-data-commons.json

ldac:
	node rocsoss.js  -m "test-ldac-cooee-mode.json" -n "testldac cooee" -d "testing a mode file made with cooee" -s test_data/ldac-soss/ro-crate-metadata.json  -o test-ldac-soss.json
