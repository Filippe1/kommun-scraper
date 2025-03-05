import { Pinecone } from '@pinecone-database/pinecone'

const pc = new Pinecone({ apiKey: "YOUR_API_KEY" })

// To get the unique host for an index, 
// see https://docs.pinecone.io/guides/data/target-an-index
const namespace = pc.index("INDEX_NAME", "INDEX_HOST").namespace("example-namespace");

// Upsert records into a namespace
// `chunk_text` fields are converted to dense vectors
// `category` and `quarter` fields are stored as metadata
await namespace.upsertRecords([
    { 
        "_id": "vec1", 
        "chunk_text": "AAPL reported a year-over-year revenue increase, expecting stronger Q3 demand for its flagship phones.", 
        "category": "technology",
        "quarter": "Q3"
    },
    { 
        "_id": "vec2", 
        "chunk_text": "Analysts suggest that AAPL'\''s upcoming Q4 product launch event might solidify its position in the premium smartphone market.", 
        "category": "technology",
        "quarter": "Q4"
    },
    { 
        "_id": "vec3", 
        "chunk_text": "AAPL'\''s strategic Q3 partnerships with semiconductor suppliers could mitigate component risks and stabilize iPhone production.",
        "category": "technology",
        "quarter": "Q3"
    },
    { 
        "_id": "vec4", 
        "chunk_text": "AAPL may consider healthcare integrations in Q4 to compete with tech rivals entering the consumer wellness space.", 
        "category": "technology",
        "quarter": "Q4"
    }
]);