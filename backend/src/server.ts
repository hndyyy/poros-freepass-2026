import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { router } from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Backend TaskFlow AI is running!');
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`API endpoints available at http://0.0.0.0:${PORT}/api`);
});
