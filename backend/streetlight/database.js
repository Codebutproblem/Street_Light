const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect("mongodb+srv://hanalhu123:TTLu1fvIhxjKwPpZ@csdl1.bbvwk.mongodb.net/light_street");
        console.log('Connect successfully');
    } catch (error) {
        console.log('Connect failure');
    }
}

module.exports = { connect };