var mongoose = require('mongoose');


// define the schema for our question model
var questionSchema = mongoose.Schema({
    question: String
});

// create the model for question and expose it to our app
module.exports = mongoose.model('Question', questionSchema);
