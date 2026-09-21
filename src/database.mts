import mongoose from "mongoose"
import grabEnv from "./helpers/grabEnv.mts"
import Setup from "./interfaces/Setup.mts"

export default {
    name: "database",
    setup: async function () {
        const { connect } = grabEnv("mongo")
        if (connect) mongoose.connect(connect)
    }
} satisfies Setup