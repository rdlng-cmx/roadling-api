import Koa from 'koa'

export default interface Setup {
    name: string
    setup: (app: Koa) => void|Promise<void>
}