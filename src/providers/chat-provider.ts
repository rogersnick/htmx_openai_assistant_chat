import { Request, Response, RequestHandler } from "express";
import { AIProvider } from "./ai-provider";
import OpenAI from "openai";
import assert from "node:assert";

class ChatProvider {
    private threadsMap: Map<string, OpenAI.Beta.Threads.Thread>;

    constructor(private aiProvider: AIProvider) {
        this.threadsMap = new Map<string, OpenAI.Beta.Threads.Thread>();
    }

    public getChatWindow(): RequestHandler {
        return (req: Request, res: Response) => {
            return res.render('views/chat', { layout: 'index' });
        }
    }

    public ask(queryOveride?: string): RequestHandler {
        return async (req: Request, res: Response) => {
            console.log('ask', { query: req.query.query })

            return res.render('views/message-user', {
                layout: 'naked-hypermedia',
                query: queryOveride ?? req.body.query,
                assistant_id: <string>process.env.ASSISTANT_ID,
            })
        }
    }

    public respond(overrideQuery?: string): RequestHandler {
        return async (req: Request, res: Response) => {
            console.log('respond', { query: req.query.query })
            const query = overrideQuery ?? <string>req.query.query;

            const { ip } = req;
            assert(ip)
            const threadId = ip ? this.threadsMap.get(ip)?.id : undefined;

            const thread = await this.aiProvider.getOrCreateThread(threadId);
            assert(thread)

            this.threadsMap.set(ip, thread)

            const response = await this.aiProvider.continueThread({
                thread,
                query,
                assistantId: <string>process.env.ASSISTANT_ID,
            });
            return res.render('views/message-assistant', { layout: 'naked-hypermedia', response })
        }
    }

    public async
}

export { ChatProvider }