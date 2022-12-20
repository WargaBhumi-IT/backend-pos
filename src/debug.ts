import CONFIG from "./config";

function getHead(h: string = "[DEBUG]") {
    return h + `[${new Date()}]`
}

export async function log(...args: Array<string>) {
    if(!CONFIG.DEBUG_MODE) return;
    console.debug(getHead() + args.join(" "));
}

export async function error(...args: Array<string>) {
    if(!CONFIG.DEBUG_MODE) return;
    console.log(getHead("ERROR") + args.join(" "));
}

