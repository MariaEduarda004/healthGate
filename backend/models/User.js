const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // A senha será armazenada em texto puro por enquanto :)
});

userSchema.methods.comparePassword = async function (password) {
    return password === this.password; // Comparação direta
};

module.exports = mongoose.model('User', userSchema);