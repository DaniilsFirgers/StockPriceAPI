require("dotenv").config();
const express = require('express');
const app = express();

//Base url
app.use('', require('./routes/api/stocks'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));