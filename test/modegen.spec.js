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
const {SOSS} = require("../lib/soss");
const {ROCrate} = require("ro-crate");
const {ModeGenerator} = require("../lib/modegen");

describe("Mode Tests", function () {
    it("Can create a mode", async function () {
        const myCrate = new ROCrate({}, {array: true, link: true});
        myCrate.rootDataset.mentions = [
            {"@id": "#person1", "@type": "Person", "name": "Peter"},
            {"@id": "#organization1", "@type": "Organization", "name": "UQ"}
        ];
        const soss = new SOSS(
            null,
            "https://purl.archive.org/languague-data-commons/terms#",
            {
                superclass: true,
            }
        );
        await soss.setup();
        await soss.load(myCrate);
        const modeGenerator = new ModeGenerator(soss.sossCrate, {
            defaultText: true,
            name: "test",
            description: "test",
            mode: undefined
        });
        assert.equal(Object.keys(modeGenerator.mode.classes).length, 3); // It should not have CreativeWork
    });
});