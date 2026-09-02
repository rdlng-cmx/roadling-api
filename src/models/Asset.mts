import { model, Schema } from "mongoose"

const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String
    }
})


export default model("Asset", schema)