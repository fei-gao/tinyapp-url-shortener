module.exports = function generateRandomString(){
    return  Math.random().toString(20).substring(2, 8);
}
