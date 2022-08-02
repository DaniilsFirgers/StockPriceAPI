require("dotenv").config();
const express = require('express');
const app = express();

//Date + ticker

app.use('', require('./routes/api/stocks'));

app.get('/', (res, req) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));