import { HttpRequest, HttpResponse } from "@fermyon/spin-sdk";
import { deleteKey, getKey, listKeys, setKey } from "./kv";
import { html } from "./page";

const encoder = new TextEncoder();
const decoder = new TextDecoder();


function returnHtml(base: string) {
    // Replace the base path to make sure APIs work correctly
    let htmlContent = html().replace("let basepath = \"\";", `let basepath = \"${base}\";`)
    let buf = encoder.encode(htmlContent).buffer;
    return { status: 200, body: buf }
}

function setupRouter(base: string) {
    const router = utils.Router();

    // Return HTML file for the viewer UI
    router.get(base + "/kv-explorer", () => { return returnHtml(base) });

    // List keys in the store
    router.get(base + "/kv-explorer/api/stores/:store", ({ params }): HttpResponse => {
        return listKeys(params.store)
    });

    // Delete key in store
    router.delete(base + "/kv-explorer/api/stores/:store/keys/:key", ({ params }): HttpResponse => {
        return deleteKey(params.store, params.key)
    });

    // Get the value of particular key
    router.get(base + "/kv-explorer/api/stores/:store/keys/:key", ({ params }): HttpResponse => {
        return getKey(params.store, params.key)
    });

    // Set value for a key
    router.post(base + "/kv-explorer/api/stores/:store", ({ params }, req): HttpResponse => {
        return setKey(params.store, req.body)
    });

    // If none of the routes above match, return a 404
    router.all("*", () => { return { status: 404 } });
    return router
}

// handleRequest is the entrypoint to the Spin handler
export async function handleRequest(request: HttpRequest): Promise<HttpResponse> {

    let basepath = spinSdk.config.get("basepath");

    // Setup router with the base path from config or default to ""
    const router = setupRouter(basepath);

    return await router.handle({
        method: request.method, url: request.uri
    }, { body: request.body });
}

