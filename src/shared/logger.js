const { createLogger, transports, format } = require('winston');
var colors = require('colors');
// console.log(colors.white.bgRed("TOKEN ERROR", err));

const custFormat = format.combine(
    format.timestamp(),
    format.printf((info)=>{
        if(info && info.level==='error'){
            return colors.white.bgRed(`${info.timestamp} [${info.level.toUpperCase()}] :${info.message}`)
        }else{
            return colors.black.bgYellow(`${info.timestamp} [${info.level.toUpperCase()}] :${info.message}`)
        }
    })
)

const logger = createLogger({
    transports : [ 
        new transports.Console({level:'silly'}),
        new transports.File({filename:'app.log',level:'error'}),
     ],
    level:'debug',
    format:custFormat
})

module.exports = logger;