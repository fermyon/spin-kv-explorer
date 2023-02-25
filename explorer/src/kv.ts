import { HttpResponse } from "@fermyon/spin-sdk";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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

function listKeys(store: string): HttpResponse {
    console.log(`Listing keys from store: ${store}`);

    try {
        let kv = spinSdk.kv.open(store);
        let keys = kv.getKeys();
        return {
            status: 200,
            body: encoder.encode(JSON.stringify({ store: store, keys: keys } as ListResult)).buffer
        }
    } catch (err) {
        console.log(`Error: ${err}`);
        return { status: 500 }
    }
}

function getKey(store: string, key: string): HttpResponse {
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
}

function deleteKey(store: string, key: string): HttpResponse {

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
}

function setKey(store: string, body: ArrayBuffer) {
    let input = JSON.parse(decoder.decode(body)) as SetInput;
    console.log(`Adding new value in store ${store}. Input: ${input.key}. Value: ${input.value}`)

    try {
        let kv = spinSdk.kv.open(store);
        kv.set(input.key, input.value);
        return { status: 200 }
    } catch (err) {
        console.log(`Error: ${err}`);
        return { status: 500 }
    }
}

export { deleteKey, getKey, listKeys, setKey }