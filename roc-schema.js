#!/usr/bin/env node


const program = require('commander');
const fs = require('fs-extra');
const path = require('path');
const ROCrate = require("ro-crate").ROCrate;
const commonmark = require("commonmark");
const _ = require("lodash");
var crateDir;

program
  .version("0.1.0")
  .description(
    "Extracts a markdown or HTML page from an RO Crate containing Schema.org style Classes and Properties "
  )
  .arguments("<d>")
  .option("-c, --config [conf]", "configuration file")
  .option(
    "--html", "Output HTML (default is markdown)"
  )
  .option(
    "-t,  --ro-crate-terms", "Output vocabulary and context file for terms"
  )
  .option(
    "-u,  --url [url]", "URL for the final result (so links can be made relative)"
  )
  .option("-o, --output-path [rep]", "Directory into which to write output", null)

crateDir = "SDSDAS"

//if (!crateDir) program.help();

program.parse(process.argv);
//if (program.args.length) program.help();

crateDir = program.args[0];
const fileBasename = path.basename(crateDir)
const outPath = program.outputPath ? program.outputPath : path.dirname(crateDir);



async function main() {
  var md = "";
  const classIndex = [];
  const propertyIndex = [];
  const termIndex = [];
  const cratePath = path.join(crateDir, "ro-crate-metadata.json");
  const crate = new ROCrate(JSON.parse(await fs.readFile(cratePath)));
  await crate.resolveContext();
  root = crate.getRootDataset();
  crate.getRootDataset().mentions = [];

  const url = program.url || "";

  function formatValue(val) {
    var links = "";

    for (let v of crate.utils.asArray(val)) {
      if (v["@id"]) {
        const resolvedTerm = crate.resolveTerm(v["@id"]);
        if (resolvedTerm) {
          links += `[<a href='${resolvedTerm.replace(url, "")}'> ${v["@id"].replace(/.*#/, "")} </a>] | `
        } else {
          links += `CANT RESOLVE  ${v["@id"]}`
        }
      }
      else {
        if (v.match(/https?:\/\//)) {
          links += `[<a href='${v}'> ${v} </a>] |`;
        } else {
          links += ` ${v} | `;
        }
      }
    }
    return links + "\n\n";
  }

  function clean(val) {
    var links = "";

    for (let v of crate.utils.asArray(val)) {
      if (v["@id"]) {
        links += `${v["@id"]}`;
      } else {
        links += `${v}`;
      }
    }
    return `"${links.replace(/"/g, '""').replace(/\n/g, " ")}"`

  }

  function addToMentions(item) {
    crate.pushValue(root, "mentions", item);
  }

  function sameAs(item) {
    if (item["sameAs"]) {
      return `Same as: ${formatValue(item["sameAs"])}\n`;

    } else {
      return "";
    }
  }

  vocab = []
  context = { "@context": "" }
  innerContext = context["@context"]

  for (let item of crate.getGraph()) {
    if (crate.utils.asArray(item["@type"]).includes("rdf:Property")) {
      addToMentions(item);
      propertyIndex.push(`<a href="#${item["rdfs:label"]}">${item["rdfs:label"]}</a>`);
      md += `<div id="${item["rdfs:label"]}"  style="border-style: solid">\n\n`;
      md += `# Property: ${item["rdfs:label"]}\n\n`;
      md += `${item["rdfs:comment"]}\n\n`;
      md += `## Values expected to be one of these types: \n\n`;
      md += `${formatValue(item.rangeIncludes)}\n\n`;
      md += `## Used on these types: \n\n`;
      md += `${formatValue(item.domainIncludes)}\n\n`;
      if (item.definedTermSet && item.definedTermSet["@id"]) {
        const termSet = crate.getItem(item.definedTermSet["@id"]);
        md += `## Values expected to be one of these defined terms: \n\n`;
        md += `${formatValue(termSet.hasDefinedTerm)}\n\n`;
      }
      md += `${sameAs(item)}\n\n`;

      md += `</div><br>\n`;


      vocab.push({
        term: clean(item.name),
        type: "Property",
        label: clean(item["rdfs:label"]),
        description: clean(item["rdfs:comment"]),
        domain: clean(item.domainIncludes),
        range: clean(item.rangeIncludes)

      })

    } else if (crate.utils.asArray(item["@type"]).includes("rdfs:Class")) {
      addToMentions(item);
      classIndex.push(`<a href="#${item["rdfs:label"]}">${item["rdfs:label"]}</a>`);

      md += `<div id="${item["rdfs:label"]}" style="border-style: solid">\n\n`;
      md += `# Class: ${item["rdfs:label"]}\n\n`;
      md += `${item["rdfs:comment"]}\n\n`;
      md += `## Subclass of \n\n  ${formatValue(item["rdfs:subClassOf"])}\n\n`;

      if (item["@reverse"] && item["@reverse"]["domainIncludes"]) {
        md += `## Properties\n\n`

        md += formatValue(item["@reverse"]["domainIncludes"])
      };
      md += `${sameAs(item)}\n\n`;
      md += `</div><br>\n`;

      vocab.push({
        term: clean(item.name),
        type: "Class",
        label: clean(item["rdfs:label"]),
        description: clean(item["rdfs:comment"]),
        domain: clean(item.domainIncludes),
        range: clean(item.rangeIncludes)
      })


    } else if (crate.utils.asArray(item["@type"]).includes("DefinedTerm")) {
      addToMentions(item);
      termIndex.push(`<a href="#${item.name}">${item.name}</a>`);

      md += `<div id="${item["name"]}"  style="border-style: solid">\n\n`;
      md += `# Defined Term: ${item["name"]}\n\n`;
      md += `${item["description"]}\n\n`;
      if (item["@reverse"] && item["@reverse"]["hasDefinedTerm"]) {
        for (let set of crate.utils.asArray(item["@reverse"]["hasDefinedTerm"])) {
          const definedTermSet = crate.getItem(set["@id"]);
          if (definedTermSet && definedTermSet["@reverse"] && definedTermSet["@reverse"].definedTermSet) {
            md += `## Is an expected value for the following property\n\n`
            md += formatValue(definedTermSet["@reverse"].definedTermSet);
          }
        }


        //md += formatValue(item["@reverse"]["domainIncludes"])
      };
      md += sameAs(item);
      md += `</div><br>\n`;
    }
  }
  fs.writeFileSync(cratePath, JSON.stringify(crate.toJSON(), null, 2))

  if (program.roCrateTerms) {
    output = "term,type,label,description,domain,range\n";
    for (let v of vocab) {
      output += `${v.term},${v.type},${v.label},${v.description},${v.domain},${v.range}\n`
    }
    await fs.writeFile(path.join(outPath, "vocabulary.csv"), output);
  }
  md = `# Classes\n\n${classIndex.join(" | ")}\n\n# Properties\n\n${propertyIndex.join(" | ")}\n\n# DefinedTerms\n\n${termIndex.join(" | ")}\n\n${md}`

  if (program.html) {
    const reader = new commonmark.Parser();
    const writer = new commonmark.HtmlRenderer();
    const parsed = reader.parse(md);
    const result = writer.render(parsed); // result is a String
    const p = path.join(outPath, `${fileBasename}.html`);
    fs.writeFile(p, result);
    console.log(`Output ${p}`);
  } else {
    const p = path.join(outPath, `${fileBasename}.md`);
    fs.writeFile(p, md);
    console.log(`Output ${p}`);

  }

}

main();

