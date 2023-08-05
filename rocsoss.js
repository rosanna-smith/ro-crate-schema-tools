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
  })  .option("d", {
    alias: "description",
    describe: "Description of this profile",
    type: "string",
  })
  .option("b", {
    alias: "base-profile",
    describe: "Make a SOSS crate (-o) and/or profile (-p) of the basic Schema.org + RO-Crate terms",
    type: "boolean",
  })
  .help().argv;

function getInputs(entity, inputs) {
  var newInputs = [];
  for (let prop of entity["@reverse"]?.["domainIncludes"] || entity["@reverse"]?.["schema:domainIncludes"] || []) {
    if (prop["rdfs:label"]) {
      // If we already have this input then just keep it
      var input = inputs.find(x => x.id === prop["rdfs:label"][0]) || {
        id: prop["@id"],
        name: prop["rdfs:label"][0],
        help: prop?.description,
        multiple: true,
        type: []
      };
      if (prop.rangeIncludes){
        for (let i of prop.rangeIncludes) {
          var label = i["rdfs:label"]?.[0];
          if (!label) {
            console.log("No label for", i)
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
   newInputs.push(getInputs(c, newInputs));
  }

  return newInputs;
}


async function main() {
  const profile = {
    metadata: {
      name: argv.name || "TEST PROFILE",
      description: argv.description || argv.name,
      version: 0,
    },
    rootDatasets: {
      Schema: {
        type: "Dataset",
      },
    },
    classes: {},
  };

  //const r = new ROCrate({ array: true, link: true });
  var vocabCrate;
  if (argv.baseProfile) {
    if (argv._.length > 0) {
       console.log("Warning -- ignoring input files", argv._)
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
  } else if (argv._.length > 0) {   // If there are files to process then these are examples
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
      exampleCrate = new ROCrate(
        fs.readJSONSync(cratePath),
        { array: true, link: true }
      );
      await soss.load(exampleCrate);
    }
    vocabCrate = soss.sossCrate;

   
  } else if (argv.sossCrate) { // Load a specific Schema (SOSS) 
    inputCrate = new ROCrate(await fs.readJSON(argv.sossCrate), {
      array: true,
      link: true,
    });
    console.log("THING - input", inputCrate.getEntity("http://schema.org/CreativeWork"))

    const soss = new SOSS(
      inputCrate,
      "https://purl.archive.org/languague-data-commons/terms#",
      {
        superclass: true,
      }
    );
    await soss.setup();

    console.log("THING", soss.sossCrate.getEntity("http://schema.org/CreativeWork"))
    vocabCrate = soss.sossCrate;


  }

   // User would like to save this SOSS
   if (argv.outputSoss && !argv.sossCrate) {
    await fs.writeJson(argv.outputSoss, vocabCrate.toJSON(), { spaces: 2 });

  }

  // If we have an output path make a profile
  if (argv.outputProfile) {
    for (let entity of vocabCrate["@graph"]) {
      if (entity["@type"].includes("rdfs:Class")) {
        if (!profile.classes[entity["rdfs:label"]]) {
          profile.classes[entity["rdfs:label"]] = {
            definition: "override",
            subClassOf: entity.subClassOf,
            inputs: []
          }
          } else {  
            inputs = entity["@type"].includes("rdfs:Class").inputs
          }
          var inputs = profile.classes[entity["rdfs:label"]].inputs;
          newInputs = getInputs(entity, inputs);
          profile.classes[entity["rdfs:label"]].inputs = newInputs.flat();
        }
      }
      await fs.writeJson(argv.outputProfile, profile, { spaces: 2 });
      //console.log(JSON.stringify(profile, null, 2))
  }

  
}

main();
