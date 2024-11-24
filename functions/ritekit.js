const axios = require("axios");
const ritekitApiUrl = "https://api.ritekit.com/v1/stats/basic/";

exports.handler = async (event, context, callback) => {
  const coinSymbol = event.queryStringParameters.coin || "BTC";

  const url = ritekitApiUrl + coinSymbol;
  const response = await axios({
    method: "get",
    url,
  }).then(function (response) {
    return response.data;
  });

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
