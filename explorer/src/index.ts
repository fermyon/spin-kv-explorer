import { HttpRequest, HttpResponse } from "@fermyon/spin-sdk";
import { html } from "./page";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const router = utils.Router();

interface SetInput {
    key: string,
    value: string
}

interface GetResult {
    store: string,
    key: string,
    value: ArrayBuffer
}

interface ListResult {
    store: string,
    keys: Array<string>
}

router.get("/api/stores/:store", async (req): Promise<HttpResponse> => {
    let store = req.params.store;
    console.log(`Listing keys from store: ${store}`);

    try {
        let kv = spinSdk.kv.open(req.params.store);
        let keys = kv.getKeys();
        return {
            status: 200,
            body: encoder.encode(JSON.stringify({ store: store, keys: keys } as ListResult)).buffer
        }
    } catch (err) {
        console.log(`Error: ${err}`);
        return { status: 500 }
    }
});


router.get("/api/stores/:store/keys/:key", async (req): Promise<HttpResponse> => {
    let store = req.params.store;
    let key = req.params.key;
    console.log(`Getting the value of key ${key} from store: ${store}`);

    try {
        let kv = spinSdk.kv.open(store);
        if (kv.exists(key)) {
            return {
                status: 200,
                body: encoder.encode(JSON.stringify({ store: store, key: key, value: kv.get(key) } as GetResult)).buffer
            }
        } else {
            return { status: 404 }
        }
    } catch (err) {
        console.log(`Error: ${err}`);
        return { status: 500 }
    }
});

router.delete("/api/stores/:store/keys/:key", async req => {
    let store = req.params.store;
    let key = req.params.key;

    console.log(`Deleting the value of key ${key} from store: ${store}`);

    try {
        let kv = spinSdk.kv.open(store);
        if (kv.exists(key)) {
            kv.delete(key);
            return { status: 200 }
        } else {
            return { status: 404 }
        }
    } catch (err) {
        console.log(`Error: ${err}`);
        return { status: 500 }
    }
});


router.post("/api/stores/:store", async (req, extra) => {
    let input = JSON.parse(decoder.decode(extra.body)) as SetInput;
    console.log(`Adding new value in store ${req.params.store}. Input: ${input.key}. Value: ${input.value}`)

    try {
        let kv = spinSdk.kv.open(req.params.store);
        kv.set(input.key, input.value);
        return { status: 200 }
    } catch (err) {
        console.log(`Error: ${err}`);
        return { status: 500 }
    }
});

router.get('/', async () => {
    let buf = encoder.encode(html()).buffer;

    return { status: 200, body: buf }
});

router.all("*", () => { return { status: 404 } });

// handleRequest is the entrypoint to the Spin handler.
export async function handleRequest(request: HttpRequest): Promise<HttpResponse> {
    return await router.handle({
        method: request.method, url: request.uri
    }, { body: request.body });
}

