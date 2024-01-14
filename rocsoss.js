#!/usr/bin/env node

const yargs = require("yargs");
const fs = require("fs-extra");
const { ROCrate } = require("ro-crate");
const { SOSS } = require("./lib/soss");
const { ModeGenerator } = require("./lib/modegen");

const argv = yargs(process.argv.slice(2))
  .scriptName("rocsoss")
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
  .option("m", {
    alias: "output-mode",
    describe: "A path for a generated mode file",
    type: "string",
  })
  .option("e", {
    alias: "existing-mode",
    describe: "A path to an existing mode on which to build",
    type: "string",
  })
  .option("i", {
    alias: "inputMode",
    describe: "A path to an existing Mode File ${filename}.json",
    type: "string",
  })
  .option("n", {
    alias: "name",
    describe: "Name of this mode",
    type: "string",
  }).option("d", {
    alias: "description",
    describe: "Description of this mode",
    type: "string",
  })
  .option("t", {
    alias: "text",
    describe:
      "Add 'Text' as an possible value type for all properties (inputs in mode terms)",
    type: "boolean",
  })
  .help().argv;



async function main() {


  //const r = new ROCrate({ array: true, link: true });
  var vocabCrate;
  var soss;
  var existingMode;

  if (argv.baseMode) {
    if (argv._.length > 0) {
      console.log("Warning -- ignoring input files", argv._);
    }
  }
    if (argv.existingMode) {
        existingMode = fs.readJSONSync(argv.existingMode);
    }
  if (argv.sossCrate) {
      // Load a specific Schema (SOSS)
      inputCrate = new ROCrate(await fs.readJSON(argv.sossCrate), {
        array: true,
        link: true,
      });
  
      soss = new SOSS(
        inputCrate,
        "https://purl.archive.org/language-data-commons/terms#",
        {
          superclass: true,
        }
      );
      await soss.setup();
  
      vocabCrate = soss.sossCrate;
    } else {
      soss = new SOSS(
      null,
      "https://purl.archive.org/language-data-commons/terms#",
      {
        superclass: true,
      }
    );
    await soss.setup();
    vocabCrate = soss.backgroundSchema;
   }
   if (argv._.length > 0) {
    // If there are files to process then these are examples
   
    for (let cratePath of argv._) {
      // Make a SOSS -- load stuff
      const exampleCrate = new ROCrate(fs.readJSONSync(cratePath), {
        array: true,
        link: true,
      });

      await soss.load(exampleCrate);
      // Note: we dont have rootTypes or conformsToURIs, moved to rootDataEntity
      // for (let c of exampleCrate.rootDataset?.conformsTo || []) {
      //   if (c["@id"] && !conformsToURIs.includes(c["@id"])) {
      //     conformsToURIs.push(c["@id"])
      //   }
      // }
      // for (let t of exampleCrate.rootDataset["@type"] || []) {
      //   if (!rootTypes.includes(t)) {
      //     rootTypes.push(t)
      //   }
      // }
    }
    vocabCrate = soss.sossCrate;

  } 

  // User would like to save this SOSS
  if (argv.outputSoss) {
    await fs.writeJson(argv.outputSoss, vocabCrate.toJSON(), { spaces: 2 });
  }

  // If we have an output path make a mode
  if (argv.outputMode) {
   modeGenerator = new ModeGenerator(vocabCrate, {
       defaultText: (argv.rootDataset || argv.text),
       name: argv.name,
       description: argv.description,
       mode: existingMode
   });
   

   // await fs.writeJson(argv.outputMode, mode, { spaces: 2 });
    var output = JSON.stringify(modeGenerator.mode, null, 2).replace(
      /"MediaObject"/g,
      `"File"`
    ); // Yes, this is hacky but it's cleaner than doing this all over the place

    await fs.writeFile(argv.outputMode, output);
    //console.log(JSON.stringify(mode, null, 2))
  }
}

main();
