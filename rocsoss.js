#!/usr/bin/env node

const yargs = require("yargs");
const fs = require("fs-extra");
const { ROCrate } = require("ro-crate");
const { SOSS } = require("./lib/soss");

const argv = yargs(process.argv.slice(2))
  .scriptName("soss2profile")
  .usage(
    "Usage: $0  -c RO-Crate containing a Schema.org Style Schema (SoSS) -p profiles/your-profile.json example-crates"
  )
  .option("s", {
    alias: "soss-crate",
    describe: "A path to SoSS (Schema.org Style Schema) crate",
    type: "string",
  })
  .option("o", {
    alias: "output-soss",
    describe:
      "A full path to output a SoSS (Schema.org Style Schema) crate generated from the input files",
    type: "string",
  })
  .option("p", {
    alias: "output-profile",
    describe: "A path to the output file for a generated profile",
    type: "string",
  })
  .option("e", {
    alias: "existing-profile",
    describe: "A path to an existing profile on which to build",
    type: "string",
  })
  .option("i", {
    alias: "inputProfile",
    describe: "A path to an existing profile ${filename}.json",
    type: "string",
  })
  .option("n", {
    alias: "name",
    describe: "Name of this profile",
    type: "string",
  }).option("d", {
    alias: "description",
    describe: "Description of this profile",
    type: "string",
  })
  .option("t", {
    alias: "text",
    describe:
      "Add 'Text' as an possible value type for all properties (inputs in profile terms)",
    type: "boolean",
  })
  .help().argv;

function getInputs(vocabCrate, entity, inputs) {
  var newInputs = [];
  for (let prop of entity["@reverse"]?.["domainIncludes"] ||
    entity["@reverse"]?.["schema:domainIncludes"] ||
    []) {
    if (prop["rdfs:label"]) {
      // If we already have this input then just keep it
      var propName =
        prop["rdfs:label"][0]?.["@value"]?.[0] || prop["rdfs:label"][0];

      var input = inputs.find((x) => x.id === propName) || {
        id: prop["@id"],
        name: propName,
        help:
          prop["rdfs:comment"][0]?.["@value"]?.[0] ||
          prop?.["rdfs:comment"]?.[0],
        multiple: true,
        type: [],
      };
      if (argv.baseProfile || argv.text) {
        input.type.push("Text");
      }
      if (prop.rangeIncludes) {
        for (let i of prop.rangeIncludes) {
          const label =
            i["rdfs:label"]?.[0]?.["@value"]?.[0] || i["rdfs:label"]?.[0];
          if (!label) {
            console.log("No label for", i);
          } else if (!input.type.includes(label)) {
            input.type.push(label);
          }
        }
      } else if (prop.definedTermSet) {
        // TODO -- this will overwrite
        input.type = ["Select"];
        input.values = prop.definedTermSet
          .map((dts) => {
            return dts.hasDefinedTerm?.map((dt) => {
              return dt;
            });
          })
          .flat();
      }
      if (input.type.length === 0) input.type = ["Text"];

      newInputs.push(input);
    }
  }
  for (let c of entity?.["rdfs:subClassOf"] || []) {
    newInputs.push(getInputs(vocabCrate, c, newInputs));
  }

  return newInputs.flat();
}

function getSubClasses(entity, alreadyGot) {
  if (!alreadyGot) {
    alreadyGot = [];
  }
  for (let sub of entity?.["@reverse"]?.["rdfs:subClassOf"] || []) {
    var className = sub["rdfs:label"][0]?.["@value"] || sub["rdfs:label"][0];
    // Hack: some things are coming out as arrays --- this is weird TODO get to the bottom of
    if (Array.isArray(className)) {
      className = className[0];
    }
    if (!alreadyGot.includes(className)) {
      alreadyGot.push(className);
      getSubClasses(sub, alreadyGot);
    }
  }
  return alreadyGot;
}

async function main() {
  const profile = {
    metadata: {
      name: argv.name || "TEST PROFILE",
      description: argv.description || argv.name,
      version: 0,
    },
    conformsToUri: [],
    rootDataset: {"type" : ["Dataset"]},
    classes: {},
  };

  //const r = new ROCrate({ array: true, link: true });
  var vocabCrate;
  const conformsToURIs = [];
  const rootTypes = [];

  if (argv.baseProfile) {
    if (argv._.length > 0) {
      console.log("Warning -- ignoring input files", argv._);
    }
    const soss = new SOSS(
      null,
      "https://purl.archive.org/languague-data-commons/terms#",
      {
        superclass: true,
      }
    );
    await soss.setup();
    vocabCrate = soss.backgroundSchema;
  } else if (argv._.length > 0) {
    // If there are files to process then these are examples
    const soss = new SOSS(
      null,
      "https://purl.archive.org/languague-data-commons/terms#",
      {
        superclass: true,
      }
    );
    await soss.setup();
    for (let cratePath of argv._) {
      // Make a SOSS -- load stuff
      exampleCrate = new ROCrate(fs.readJSONSync(cratePath), {
        array: true,
        link: true,
      });

      await soss.load(exampleCrate);
      for (let c of exampleCrate.rootDataset?.conformsTo || []) {
        if (c["@id"] && !conformsToURIs.includes(c["@id"])) {
          conformsToURIs.push(c["@id"])
        }
      }
      for (let t of exampleCrate.rootDataset["@type"] || []) {
        if (!rootTypes.includes(t)) {
          rootTypes.push(t)
        }
      }
    }
    vocabCrate = soss.sossCrate;
  } else if (argv.sossCrate) {
    // Load a specific Schema (SOSS)
    inputCrate = new ROCrate(await fs.readJSON(argv.sossCrate), {
      array: true,
      link: true,
    });

    const soss = new SOSS(
      inputCrate,
      "https://purl.archive.org/languague-data-commons/terms#",
      {
        superclass: true,
      }
    );
    await soss.setup();

    vocabCrate = soss.sossCrate;
  }

  // User would like to save this SOSS
  if (argv.outputSoss && !argv.sossCrate) {
    await fs.writeJson(argv.outputSoss, vocabCrate.toJSON(), { spaces: 2 });
  }

  // If we have an output path make a profile
  if (argv.outputProfile) {
    for (let c of conformsToURIs) {
      if (!profile.conformsToUri.includes(c)) {
        profile.conformsToUri.push(c)
      }
    }
    for (let t of rootTypes) {
      if (!profile.rootDataset.type.includes(t)) {
        profile.rootDataset.type.push(t)
      }
    }
    for (let entity of vocabCrate["@graph"]) {
      if (entity["@type"].includes("rdfs:Class")) {
        const className =
          entity["rdfs:label"][0]?.["@value"]?.[0] || entity["rdfs:label"][0];

        if (!profile.classes[className]) {
          profile.classes[className] = {
            hasSubclass: getSubClasses(entity),
            inputs: [],
          };
        } else {
          inputs = entity["@type"].includes("rdfs:Class").inputs;
        }
        var inputs = profile.classes[className].inputs;
        newInputs = getInputs(vocabCrate, entity, inputs);
        profile.classes[className].inputs = newInputs.flat();
      }
    }
   

   // await fs.writeJson(argv.outputProfile, profile, { spaces: 2 });
    var output = JSON.stringify(profile, null, 2).replace(
      /"MediaObject"/g,
      `"File"`
    ); // Yes, this is hacky but it's cleaner than doing this all over the place

    await fs.writeFile(argv.outputProfile, output);
    //console.log(JSON.stringify(profile, null, 2))
  }
}

main();
