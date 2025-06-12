import { FastifyInstance } from 'fastify';
import { Article } from './interfaces/Article';
import DynamoDBHandler from './dynamoDBHandler';

const dynamoDBClient = new DynamoDBHandler();

export default async function lambdaHandler(fastify: FastifyInstance) {
  // POST /articles - add multiple articles
  fastify.post('/articles', async (request, reply) => {
    const articles = request.body as Article[];

    try {
      const results = await Promise.all(
        articles.map(article => dynamoDBClient.addRecord(article))
      );

      reply.status(200).send({ results });
    } catch (error: any) {
      reply.status(500).send({ error: error.message || 'Internal Server Error' });
    }
  });

  // GET /articles - fetch articles with optional filters
  fastify.get('/articles', async (request, reply) => {
    // Extract query parameters (all optional)
    const { keyword, participant, date, latest, limit } = request.query as {
      keyword?: string;
      participant?: string;
      date?: string;
      latest?: string; // will parse to boolean
      limit?: string;  // will parse to number
    };

    try {
      let articles: Article[] = [];

      if (keyword) {
        articles = await dynamoDBClient.getArticlesByKeyword(keyword);
      } else if (participant) {
        articles = await dynamoDBClient.getArticlesByParticipant(participant);
      } else if (date) {
        articles = await dynamoDBClient.getArticleByDate(date);
      } else if (latest && latest.toLowerCase() === 'true') {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        articles = await dynamoDBClient.getLatestArticles(limitNum);
      } else {
        // No filter specified, consider returning an error or empty list
        articles = [];
      }

      reply.status(200).send({ articles });
    } catch (error: any) {
      reply.status(500).send({ error: error.message || 'Internal Server Error' });
    }
  });
}
