import { model, Schema } from "mongoose"

const schema = new Schema({
    authors: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    conditions: {
        type: String
    }
})

export default model("Comic", schema)