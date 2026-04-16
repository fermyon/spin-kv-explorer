# Spin key/value explorer

This is a simple Spin component for exploring the contents of key/value stores.

## Using the key/value explorer

First, configure the template:

```bash
$ spin templates install --git https://github.com/fermyon/spin-kv-explorer
Copying remote template source
Installing template kv-explorer...
Installed 1 template(s)

+------------------------------------------------------+
| Name          Description                            |
+======================================================+
| kv-explorer   Explore the contents of Spin KV stores |
+------------------------------------------------------+
```

Then, you can either create a new application, or add this component to your existing app:

```bash
$ spin new -t kv-explorer
# OR
$ spin add -t kv-explorer
```

This will create the following component in your `spin.toml`:

```toml
[[trigger.http]]
component = "kv-explorer"
route = "/internal/kv-explorer/..."

[component.kv-explorer]
source = { url = "https://github.com/fermyon/spin-kv-explorer/releases/download/v0.10.0/spin-kv-explorer.wasm", digest = "sha256:65bc286f8315746d1beecd2430e178f539fa487ebf6520099daae09a35dbce1d" }
allowed_outbound_hosts = ["redis://*:*", "mysql://*:*", "postgres://*:*"]
# add or remove stores you want to explore here
key_value_stores = ["default"]

[component.kv-explorer.variables]
kv_credentials = "{{ kv_explorer_user }}:{{ kv_explorer_password }}"

[variables]
kv_explorer_user = { required = true }
kv_explorer_password = { required = true }

```

You can now access the explorer in your browser at the route `/internal/kv-explorer`.

### Credentials

Locally, you configure variables using a [variable provider](https://developer.fermyon.com/spin/v2/dynamic-configuration#application-variables-runtime-configuration).
For example, the username and password can be configured using the environment variable provider as follows:

```bash
$ SPIN_VARIABLE_KV_EXPLORER_USER=user SPIN_VARIABLE_KV_EXPLORER_PASSWORD=pw spin up
```

When running locally, you can skip checking for the credentials on every request by passing the `SPIN_APP_KV_SKIP_AUTH` environment variable:

```bash
$ spin up --env SPIN_APP_KV_SKIP_AUTH=1
```

When deploying to [Fermyon Cloud](https://fermyon.com/cloud), you are required to set the username and password for the kv explorer with the `spin deploy` command:

```bash
# change the value to your desired basic authentication credentials
$ spin deploy --variable kv_explorer_user="some-username" --variable kv_explorer_password="some-password"
```

The explorer will use the config variables store to persist the credentials to access the UI and the API. If no values are set, a forbidden error is returned.

## REST API

In addition to the UI, the component exposes REST endpoints under the explorer route.
If your route is `/internal/kv-explorer`, the API base is:

```text
/internal/kv-explorer/api
```

All API requests require HTTP Basic Auth unless `SPIN_APP_KV_SKIP_AUTH=1` is set.

### Endpoints

| Operation | Method | Path | Notes |
| --- | --- | --- | --- |
| List all pairs (keys) in a store | `GET` | `/api/stores/:store` | Returns keys in the store. |
| Set/update a pair | `POST` | `/api/stores/:store` | Creates or overwrites a key/value pair. |
| Get a single pair | `GET` | `/api/stores/:store/keys/:key` | `:key` must be safe-encoded (see below). |
| Delete a single pair | `DELETE` | `/api/stores/:store/keys/:key` | `:key` must be safe-encoded (see below). |

### Request/response shapes

Set/update pair request body:

```json
{
	"key": "my-key",
	"value": "updated value"
}
```

List response (`GET /api/stores/:store`):

```json
{
	"store": "default",
	"keys": ["my-key", "another-key"]
}
```

Get response (`GET /api/stores/:store/keys/:key`):

```json
{
	"store": "default",
	"key": "bXkta2V5",
	"value": "dXBkYXRlZCB2YWx1ZQ=="
}
```

Notes:
- JSON `value` in the get response is base64-encoded by the Go JSON encoder (because it is a byte array).
- For `:key` path params, use the safe key format expected by this service: standard base64 of the raw key bytes, then replace `/` with `-`.

### Examples

```bash
# List keys in a store
curl -u "some-username:some-password" \
	"http://127.0.0.1:3000/internal/kv-explorer/api/stores/default"

# Set/update a key
curl -u "some-username:some-password" \
	-H "Content-Type: application/json" \
	-X POST "http://127.0.0.1:3000/internal/kv-explorer/api/stores/default" \
	-d '{"key":"my-key","value":"updated value"}'

# Get one key ("my-key" => base64 "bXkta2V5")
curl -u "some-username:some-password" \
	"http://127.0.0.1:3000/internal/kv-explorer/api/stores/default/keys/bXkta2V5"

# Delete one key
curl -u "some-username:some-password" \
	-X DELETE "http://127.0.0.1:3000/internal/kv-explorer/api/stores/default/keys/bXkta2V5"
```

### Status codes

- `200 OK`: Successful list, set/update, get, or delete operation.
- `400 Bad Request`: Malformed JSON body for set/update.
- `401 Unauthorized`: Missing/invalid basic auth.
- `404 Not Found`: Key not found for get/delete.
- `500 Internal Server Error`: Store open/list/set failures.
