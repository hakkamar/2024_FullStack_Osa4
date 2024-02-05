const app = require("./app"); // varsinainen Express-sovellus
const config = require("./utils/config");
const logger = require("./utils/logger");

//require("dotenv").config();

const PORT = process.env.PORT;

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

/*
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
*/
