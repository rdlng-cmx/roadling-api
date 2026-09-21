import 'dotenv/config'
import Koa from 'koa'
import cors from '@koa/cors'
import logger from './middleware/logger.mts';
import { bodyParser } from '@koa/bodyparser';
import components from './components.mts'
import routes from './routes.mts'
import database from './database.mts';
import wait from './helpers/wait.mts';

export const app = new Koa();

console.log("𖨆 daula.")
//await wait(500)

app
    .use(cors())
    .use(bodyParser())
    .use(logger)
const setups = [components, routes, database]
for (const setup of setups) {
    console.log("𖨆 setting up " + setup.name)
    await setup.setup(app)
    await wait(500)
}
    


app.listen(3000)