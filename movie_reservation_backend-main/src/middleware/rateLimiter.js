const rateLimit=require('express-rate-limit');

const globalLimiter=rateLimit({
    windowMs: 1*60*1000,
    max:100,
    message:{
        success:false,
        error:'too many requests at once, please try again later.'
    }
});

const authLimiter=rateLimit({
    windowMs:1*60*1000,
    max: 10,
    message:{
        success:false,
        error:'too many login requests, please try again later.'
    }
});

module.exports ={ globalLimiter,authLimiter};