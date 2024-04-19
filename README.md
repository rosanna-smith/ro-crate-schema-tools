# ro-crate-schema-tools


This repository contains node-based tools for Research Object Crate [RO-Crate](https://www.researchobject.org/ro-crate/) to be used for creating and distributing Schema.org style ontologies (SOSSs) and Mode Files for configuring the [Crate-O editor](https://github.com/Language-Research-Technology/crate-o).

# BREAKING NEWS -- We are changing the term "Profile" in the context of Crate-O to the term "Mode File" -- changes will be made in early 2024 in all the repositories but there may be some inconsistencies for a while


## Background: What's a Schema.org Style Schema?

Schema.org is available in schema.org [JSON-LD format](https://schema.org/version/latest/schemaorg-current-https.jsonld). 

For example, `schema:Dataset` has the following definition:

```
   {
      "@id": "schema:Dataset",
      "@type": "rdfs:Class",
      "owl:equivalentClass": [
        {
          "@id": "dcmitype:Dataset"
        },
        {
          "@id": "dcat:Dataset"
        },
        {
          "@id": "void:Dataset"
        }
      ],
      "rdfs:comment": "A body of structured information describing some topic(s) of interest.",
      "rdfs:label": "Dataset",
      "rdfs:subClassOf": {
        "@id": "schema:CreativeWork"
      },
      "schema:source": {
        "@id": "http://www.w3.org/wiki/WebSchemas/SchemaDotOrgSources#source_DatasetClass"
      }
   }
```

Note that while there is a `schema:Class` Class, but we follow Schema.org practice and use `rdfs:Class` and `rdf:Property` for describing classes and schemas.

## About the tools

These tools:

-  Create SOSS schemas from example RO-Crates
-  Create (and soon to incrementally update) RO-Crate Editor ~~profiles~~ Mode Files that can be used to drive editors such as Crate-O.
-  Produce static markdown and html documentation for SOSSs, you can put this on the web and use it to provide resolution to human-readable definitions of your linked data terms
 



## To generate documentation for a SOSS Crate

To see the usage:

 -  type `>> node roc-schema.js  -h`

 ```
Usage: roc-schema [options] <d>

Extracts a markdown or HTML page from an RO Crate that containx Schema.org style Classes and Properties 

Options:
  -V, --version            output the version number
  -c, --config [conf]      configuration file
  --html                   Output HTML (default is markdown)
  -t,  --ro-crate-terms    Output vocabulary and context file for terms
  -u,  --url [url]         URL for the final result (so links can be made relative)
  -o, --output-path [rep]  Directory into which to write output (default: null)
  -h, --help               display help for command
```



## To generate or update a SOSS Crate from one or more examples

The Makefile contains some examples.

To make a generic RO-Crate Editor ~~Profile~~ Mode File:

```make generic```

To make a base ~~profile~~ Mode File that includes ALL of schema.org plus the RO-Crate add-ins:

```make base```

For usage

```rocsoss --help```








