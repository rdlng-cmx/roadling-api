import { model, Schema } from "mongoose"

const stateSchema = new Schema({
    comic: {
        type: Schema.Types.ObjectId,
        ref: "Comic",
        required: true
    },
    flags: {
        type: Schema.Types.Map,
        of: String,
        default: () => ({})
    }
})

const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    socials: {
        type: Schema.Types.Map,
        of: String,
        default: () => ({})
    },
    states: [stateSchema]
})



export default model("User", schema)