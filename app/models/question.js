var mongoose = require('mongoose');


// define the schema for our question model
var questionSchema = mongoose.Schema({
    question: String,
    option1: String,
    option2: String,
    option3: String,
    option4: String
});

// create the model for question and expose it to our app
module.exports = mongoose.model('Question', questionSchema);
