import express from 'express';
import { engine } from 'express-handlebars';
import { ChatProvider } from './providers/chat-provider';
import { AIProvider } from './providers/ai-provider';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

// Handlebars Rendering Engine:
app.set('view engine', 'hbs');
app.set('views', __dirname);
app.engine('hbs', engine({
  extname: 'hbs'
}));
// Dreaded body parsing middle ware:
app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
  bodyParser.urlencoded({ extended: true })(req, res, next);
});

// The Business
const aiProvider = new AIProvider();
const chatProvider = new ChatProvider(aiProvider);

// "Normal" HTML (full page response)
app.get('/', chatProvider.getChatWindow());

// Partials (Naked Hypermedia Responses)
app.post('/chat/send', chatProvider.ask());
app.get('/chat/respond', chatProvider.respond());

app.listen(port, () => {
  return console.log(`App is listening at http://localhost:${port}`);
});