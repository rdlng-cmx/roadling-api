import { model, Schema } from "mongoose"

const schema = new Schema({
    authors: [{
            type: Schema.Types.ObjectId,
            ref: "User"
    }],
    comics: [{ type: Schema.Types.ObjectId, ref: 'Comic' }],
    flags: {
        type: Schema.Types.Map,
        of: String,
        default: () => ({})
    }
})

export default model("Series", schema)