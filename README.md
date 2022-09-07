# ro-crate-schema-tools


Tools for RO-Crate to be used for creating and distributing Schema.org style ontologies. 

Given an RO-Crate contining `rdfs:Class`, `rdf:Property`, `schema:DefinedTerm` and 'schema:DefinedTermSet` definitions, this code can generate:

-  HTML or Markdown landing pages to document an ontology - eg <http://purl.archive.org/textcommons/terms>

-  A Context file for inclusion in a crate or other JSON-LD



## Background

Schema.org is available in ... schema.org [JSON-LD format](https://schema.org/version/latest/schemaorg-current-https.jsonld). 

For example, schema:Dataset has the followingn definition:

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
    },

```

Note that there is a schema:Class Class, but we follow Schema.org practice and use rdfs:Class and rdf:Property for describing classes and schemas.


## Usage





