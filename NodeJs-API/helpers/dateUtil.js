var getUnixTimestamp = function(date)
{
    return date.getTime() / 1000;
}

var getUnixTimeStampClean = function(date)
{
    var unixTimeStamp = getUnixTimestamp(date);
    return unixTimeStamp.toString().replace(/\D/g,'');
}

module.exports = {
    getUnixTimeStampClean
}