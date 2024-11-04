import AWS from 'aws-sdk';

export const handler = async (event) => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const tableName = 'Recomendations';

  const pkValue = event.queryStringParameters?.nome;

  if (!pkValue) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'PK is required' })
    };
  }

  const params = {
    TableName: tableName,
    Key: {
      PK: pkValue
    }
  };

  try {
    const data = await dynamoDB.get(params).promise();

    if (data.Item) {
      return {
        statusCode: 200,
        body: {
          answer: data.Item
        }
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving item', error: error.message })
    };
  }
};
