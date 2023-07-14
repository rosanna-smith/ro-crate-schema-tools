# ro-crate-schema-tools


This repository contains node-based tools for [RO-Crate]() to be used for creating and distributing Schema.org style ontologies. (SOSSs)



## Background: What's a Schema.org Style Schema?

Schema.org is available in ... schema.org [JSON-LD format](https://schema.org/version/latest/schemaorg-current-https.jsonld). 

For example, `schema:Dataset` has the followinng definition:

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

Note that there is a `schema:Class` Class, but we follow Schema.org practice and use `rdfs:Class` and `rdf:Property` for describing classes and schemas.

## About the tools

These tools:

-  Create SOSS schemas from example RO-Crates
-  Create (and soon to incrementally update) RO-Crate Editor profiles that can be used to drive editors such as Crate-O.
-  Produce static markdown and html documentation for SOSSs, you can put this on the web and use it to provide resolution to human-readable definitions of your linked data terms
-  



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





