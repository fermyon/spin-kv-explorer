# Spin key/value explorer

This is a simple Spin component for exploring the contents of key/value stores.

## Using the key/value explorer

First, configure the template:

```bash
$ spin templates install --git https://github.com/radu-matei/spin-kv-explorer
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
$ spin new kv-explorer
# OR
$ spin add kv-explorer
```

This will create the following component in your `spin.toml`:

```toml
[[component]]
source = { url = "https://github.com/radu-matei/spin-kv-explorer/releases/download/<latest-release>/spin-kv-explorer.wasm", digest = "sha256:aaa" }
id = "kv-explorer"
# add or remove stores you want to explore here
key_value_stores = ["default"]
[component.trigger]
route = "/internal/kv-explorer/..."
```

You can now access the explorer in your browser at the route `/internal/kv-explorer`.

### Credentials

The explorer will use the default store to persist the credentials to access the UI and the API. If no values are set, the first invocation will set a randomly generated pair of username and password under the `kv-credentials` key, with the value following the `user:password` format. On the first run, the values will be printed in the logs, and they can be used to log in and change them (creating a new `credentials` value will override the existing value).

### Known limitations

- currently, the explorer can only be used with Spin's default key/value store. When this will be configurable, this component will support working with custom stores as well.

- the route cannot currently be changed: `/internal/kv-explorer/...`. See [this issue](https://github.com/radu-matei/spin-kv-explorer/issues/1)
