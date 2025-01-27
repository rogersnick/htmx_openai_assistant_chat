import OpenAI from "openai";
import { TextContentBlock } from "openai/resources/beta/threads/messages";


class AIProvider {
    private openAI: OpenAI;

    constructor() {
        this.openAI = new OpenAI({ apiKey: <string>process.env.OPENAI_API_KEY })
    }


    public async getOrCreateThread(threadId?: string): Promise<OpenAI.Beta.Threads.Thread> {
        if (!threadId) {
            const thread = await this.openAI.beta.threads.create();
            return thread;
        }

        return this.openAI.beta.threads.retrieve(threadId);
    }

    public async continueThread(params: {
        thread: OpenAI.Beta.Threads.Thread,
        assistantId: string,
        query: string
    }): Promise<string> {

        // add message to thread, and then run
        await this.openAI.beta.threads.messages.create(
            params.thread.id,
            {
                role: "user",
                content: params.query
            }
        );
        const run = await this.openAI.beta.threads.runs.create(
            params.thread.id,
            {
                assistant_id: params.assistantId
            }
        );

        return this.advanceRun(run);
    }

    private async advanceRun(run: OpenAI.Beta.Threads.Runs.Run & { _request_id?: string | null }): Promise<string> {
        while (['queued', 'in_progress', 'cancelling', 'requires_action'].includes(run.status)) {
            if (run.status === 'requires_action') {
                console.log('requires action!');
                if (run.required_action?.submit_tool_outputs) {
                    console.log(run.required_action.submit_tool_outputs.tool_calls)
                    const tool_outputs = await this.getToolOutputs(run.required_action.submit_tool_outputs.tool_calls);
                    await this.openAI.beta.threads.runs.submitToolOutputs(
                        run.thread_id,
                        run.id,
                        { tool_outputs }
                    );
                }
            }

            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 1 half second
            run = await this.openAI.beta.threads.runs.retrieve(
                run.thread_id,
                run.id
            );
        }

        if (run.status === 'completed') {
            const messages = await this.openAI.beta.threads.messages.list(
                run.thread_id
            );

            const response = (messages.data[0].content[0] as TextContentBlock).text.value;
            if (response) return response;
        } else {
            console.log(run.status);
        }

    }

    public async getToolOutputs(
        toolCalls: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall[]
    ): Promise<OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[]> {
        console.log(`Tool Output Requested: ${toolCalls.map(tc => tc.function.name).join(' ')}`)
        return toolCalls.map(call => {
            if (call.function.name === 'get_current_date') {
                const today = new Date();

                return {
                    tool_call_id: call.id,
                    // eg: { "today": "Monday,  01-27-2025" }
                    output: JSON.stringify({
                        today: `${today.toLocaleString('en', { weekday: 'long' })}, ${today.toLocaleDateString()}`
                    })
                }
            }
            return;
        }).filter(Boolean)
    }
}

export { AIProvider }
