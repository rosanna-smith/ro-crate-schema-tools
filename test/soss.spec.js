/* This is part of rocrate schema tools, a node library for implementing the RO-Crate data
packaging spec. Copyright (C) 2023 University of Queensland

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const fs = require("fs-extra");
const assert = require("assert");
const { SOSS } = require("../lib/soss");
const { ROCrate } = require("ro-crate");

describe("Simple tests", function () {
  it("Can set up a basic crate with the core vocab in backgroundSchema", async function () {
    //this.timeout(10000);
    const soss = new SOSS();
    await soss.setup();
    console.log(soss.backgroundSchema.resolveTerm("KAT"));
    assert.ok(
      soss.backgroundSchema.getEntity(
        soss.backgroundSchema.resolveTerm("RepositoryObject")
      )
    );
    assert.ok(
      soss.backgroundSchema.getEntity(
        soss.backgroundSchema.resolveTerm("pcdm:RepositoryObject")
      )
    );
    assert.ok(
      soss.backgroundSchema.getEntity(
        soss.backgroundSchema.resolveTerm("author")
      )
    );
    assert.ok(
      soss.backgroundSchema.getEntity(
        soss.backgroundSchema.resolveTerm("schema:author")
      )
    );
  });

  it("Test Inferring a Schema", async function () {
    //this.timeout(10000);
    const soss = new SOSS();
    await soss.setup();
    myCrate = new ROCrate({ array: true, link: true });
    myCrate.rootDataset.mentions = {
      "@type": "SomeWeirdType",
      "@id": "#item1",
    };
    await soss.load(myCrate);
    console.log(soss.sossCrate.resolveTerm("SomeWeirdType"));

    assert.ok(
      soss.sossCrate.getEntity(soss.sossCrate.resolveTerm("SomeWeirdType"))
    );
    //console.log(soss.sossCrate.toJSON());
  });

  it("Can backfill Schema.org stuff into the Language Data Commons Schema", async function () {


    myCrate = new ROCrate(
		fs.readJSONSync(
		  "../language-research-technology/language-data-commons-vocabs/ontology/ro-crate-metadata.json"
		),
		{ array: true, link: true }
	  );
    const soss = new SOSS(myCrate, "https://purl.archive.org/terms#", {
      superclass: true,
    });
    await soss.setup();
	await soss.load(myCrate);

  
    assert.ok(soss.sossCrate.getEntity(soss.sossCrate.resolveTerm("Thing")));
	console.log()
    for (let e of soss.sossCrate.entities()) {
      if (e["@type"].includes("URL")) {
        soss.sossCrate.deleteEntity(e);
      }
    }

    fs.writeJSONSync("ro-crate-metadata.json", soss.sossCrate.toJSON(), {
      spaces: 2,
    });
  });
});
