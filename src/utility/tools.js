window.logcount = 0;
window.errorcount = 0;
window.infocount = 0;
window.warncount = 0;
window.log = function ()
{
    logcount++;
    switch(arguments.length)
    {
        case 0:
            console.trace(logcount);
            break;
        case 1:
            console.trace(arguments[0]);
            break;
        default:
            console.group("log"+logcount+" : '%s'", arguments[0]);
            for (var i = 1; i < arguments.length; i++)
            {
                console.trace(arguments[i]);
            }
            console.groupEnd();
    }
}

window.logif = function ()
{
    logcount++;
    switch(arguments.length)
    {
        case 0:
            console.trace(logcount);
            break;
        case 1:
            console.trace(arguments[0]);
            break;
        default:
            if(arguments[1] == arguments[0])
            {
                console.group("log"+logcount+" : '%s'", arguments[1]);
                for (var i = 1; i < arguments.length; i++)
                {
                    console.trace(arguments[i]);
                }
                console.groupEnd();
            }
    }
}

window.error = function ()
{
    errorcount++;
    switch(arguments.length)
    {
        case 0:
            console.error(errorcount);
            break;
        case 1:
            console.error(arguments[0]);
            break;
        default:
            console.group("error"+errorcount+" : '%s'", arguments[0]);
            for (var i = 1; i < arguments.length; i++)
            {
                console.error(arguments[i]);
            }
            console.groupEnd();
    }
}

window.info = function ()
{
    infocount++;
    switch(arguments.length)
    {
        case 0:
            console.info(infocount);
            break;
        case 1:
            console.info(arguments[0]);
            break;
        default:
            console.group("info"+infocount+" : '%s'", arguments[0]);
            for (var i = 1; i < arguments.length; i++)
            {
                console.info(arguments[i]);
            }
            console.groupEnd();
    }
}

window.warn = function ()
{
    warncount++;
    switch(arguments.length)
    {
        case 0:
            console.warn(warncount);
            break;
        case 1:
            console.warn(arguments[0]);
            break;
        default:
            console.group("warn"+warncount+" : '%s'", arguments[0]);
            for (var i = 1; i < arguments.length; i++)
            {
                console.warn(arguments[i]);
            }
            console.groupEnd();
    }
}
