#!/usr/bin/env node

const yargs = require("yargs");
const fs = require("fs-extra");
const { ROCrate } = require("ro-crate");
const { SOSS } = require("./lib/soss");
const { ProfileGenerator } = require("./lib/profilegen");

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



async function main() {


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
      "https://purl.archive.org/language-data-commons/terms#",
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
      "https://purl.archive.org/language-data-commons/terms#",
      {
        superclass: true,
      }
    );
    await soss.setup();
    for (let cratePath of argv._) {
      // Make a SOSS -- load stuff
      const exampleCrate = new ROCrate(fs.readJSONSync(cratePath), {
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
      "https://purl.archive.org/language-data-commons/terms#",
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
   profileGenerator = new ProfileGenerator(vocabCrate, conformsToURIs, rootTypes, {defaultText: (argv.rootDataset || argv.text), name: argv.name, description: argv.description})
   

   // await fs.writeJson(argv.outputProfile, profile, { spaces: 2 });
    var output = JSON.stringify(profileGenerator.profile, null, 2).replace(
      /"MediaObject"/g,
      `"File"`
    ); // Yes, this is hacky but it's cleaner than doing this all over the place

    await fs.writeFile(argv.outputProfile, output);
    //console.log(JSON.stringify(profile, null, 2))
  }
}

main();
