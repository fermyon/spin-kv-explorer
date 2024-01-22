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
$ spin new kv-explorer
# OR
$ spin add kv-explorer
```

This will create the following component in your `spin.toml`:

```toml
[[component]]
source = { url = "https://github.com/fermyon/spin-kv-explorer/releases/download/<latest-release>/spin-kv-explorer.wasm", digest = "sha256:aaa" }
id = "kv-explorer"
# add or remove stores you want to explore here
key_value_stores = ["default"]
[component.trigger]
route = "/internal/kv-explorer/..."
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
