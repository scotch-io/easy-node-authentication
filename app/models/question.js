var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({

    categories: String,
    question: String,

    option1: String,
    option2: String,
    option3: String,
    option4: String,
    answers: {
        option1: Boolean,
        option2: Boolean,
        option3: Boolean,
        option4: Boolean

    }

});

module.exports = mongoose.model('Question', questionSchema);
