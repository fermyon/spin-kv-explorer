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

### Known limitations

- currently, the explorer can only be used with Spin's default key/value store. When this will be configurable, this component will support working with custom stores as well.

- the route cannot currently be changed: `/internal/kv-explorer/...`. See [this issue](https://github.com/radu-matei/spin-kv-explorer/issues/1)
