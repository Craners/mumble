var getUnixTimestamp = function(date)
{
    return date.getTime() / 1000;
}

var getUnixTimeStampClean = function(date)
{
    var unixTimeStamp = getUnixTimestamp(date);
    var timestamp = unixTimeStamp.toString().replace(/\D/g,'');

    if(timestamp.length === 12)
    {
        timestamp = `${timestamp}0`;
    }
    return timestamp;
}

module.exports = {
    getUnixTimeStampClean
}