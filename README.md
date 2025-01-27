<!-- markdownlint-disable MD001 MD033 -->
# HTMX OpenAI Chat With Assistant

This project is a simple Chat Interface for use with agents from OpenAI. It is made entirely with htmx, tailwind, express and and express-handlebars. Threads are persisted in memory based on incoming ip address. The assistant has basic tool use set up. This is experimental and not intended for production use.

![Alt Text](readme_images/demo.gif)

# Requirements

- Node
- OpenAI API Key

# Setup

Head over to the [Open AI Playground](https://platform.openai.com/playground/assistants) and create an assistant. Make a note of it's ID. You should also copy down you API Key.

To install required packages (express, handlebars, and openai mostly), run

```bash
npm i
```

Duplicate `.env.sample` and name it `.env.development`. Fill in the values for `OPENAI_API_KEY` and `ASSISTANT_ID`. You can now run the project locally with nodemon using:

```bash
npm run dev
```

You should see this in the terminal.

```bash
App is listening at http://localhost:3000
```

Congratulations! Open [localhost:3000](http://localhost:3000) in your favourite browser, and begin interacting with your Assistant. 

<img src="readme_images/app-sketch.png" alt="drawing" style="width:80%;"/>


## Tool Usage

Tool usage is handled in the class `AIProvider` by the method `getToolOutputs`. There is an example called implementation called `get_current_date`. To give your assistant access to this tool, you can add the following function definition in the OpenAI console.

```json
{
  "name": "get_current_date",
  "description": "This method will return the current date in standard ISO format YYYY-MM-DD",
  "strict": false,
  "parameters": {
    "type": "object",
    "properties": {
      "dummy_property": {
        "type": "null"
      }
    },
    "required": []
  }
}
```

# Want to Help?

I will gladly read any pull request, and in particular these tasks look interesting to me:

- add interface to input custom ASSISTANT_ID and OPENAI_API_KEY (right now you set an env variable)
- add streaming responses and handle that
- add media handling (eg - images)
