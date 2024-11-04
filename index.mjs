import fetch from 'node-fetch';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const handler = async (event) => {
    const openai_api_key = process.env.OPENAI_API_KEY;
    const prompt = `Dê recomendações de estudo para alguém que queira estudar ${event.assunto} tendo nivel ${event.nivel} de conhecimento no assunto`;

    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    console.log("Iniciando chamada à API do OpenAI");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openai_api_key}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{"role": "user", "content": prompt}],
            max_tokens: 500
        })
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    const command = new PutCommand({
        TableName: "Recomendations",
        Item: {
            nome: event.nome + event.assunto,
            assunto: event.assunto,
            nivel: event.nivel,
            resposta: answer
        },
    });

    console.log("Salvando dados no DynamoDB");
    const dbResponse = await docClient.send(command);
    console.log("Dados salvos no DynamoDB com sucesso");

    return {
        statusCode: 200,
        body: {
            nome: event.nome + event.assunto,
            prompt: prompt,
            answer: answer
        }
    };
};
