package main

import (
	"crypto/subtle"
	_ "embed"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	spinhttp "github.com/fermyon/spin/sdk/go/v2/http"
	kv "github.com/fermyon/spin/sdk/go/v2/kv"
	"github.com/fermyon/spin/sdk/go/v2/variables"
)

var KV_STORE_CREDENTIALS_KEY string = "kv_credentials"
var SKIP_AUTH_ENV string = "SPIN_APP_KV_SKIP_AUTH"

// At build time, read the contents of index.html and embed it in the `Html` variable.
// The goal for this is having a single wasm binary that can be added using `spin add`.

//go:embed index.html
var HTMLTemplate string

// SetRequest is the request body sent by the client to set set a new key/value pair.
type SetRequest struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// GetResult is the result returned by the server for a key/value pair request.
type GetResult struct {
	Store string `json:"store"`
	Key   string `json:"key"`
	Value []byte `json:"value"`
}

// ListResult is the result returned by the server for a list request.
type ListResult struct {
	Store string   `json:"store"`
	Keys  []string `json:"keys"`
}

var logger *log.Logger

func init() {
	// The entry point to a Spin HTTP request using the Go SDK.
	spinhttp.Handle(func(w http.ResponseWriter, r *http.Request) {
		logger = log.New(os.Stderr, "", log.LstdFlags)
		serve(w, r)
	})
}

// spinRoute is the base url of the spin component
var spinRoute string

func getBasePath(h http.Header) string {
	base := h.Get("Spin-Base-Path")
	component := h.Get("Spin-Component-Route")
	root := path.Join(base, component)

	// add trailing `/`
	if root[len(root)-1] != '/' {
		root = root + "/"
	}
	return root
}

// Setup the router and handle the incoming request.
func serve(w http.ResponseWriter, r *http.Request) {
	user, pass := "", ""
	if !ShouldSkipAuth() {
		var err error
		user, pass, err = GetCredentials()
		if err != nil {
			fmt.Fprintf(w, "KV explorer credentials not configured.\n")
			w.WriteHeader(http.StatusForbidden)
			return
		}
	}

	spinRoute = getBasePath(r.Header)
	router := spinhttp.NewRouter()

	// Access to the list, get, create, and delete KV pairs endpoints is behind basic auth,
	// with the credentials stored in the config store.
	router.GET(path.Join(spinRoute, "/api/stores/:store"), BasicAuth(ListKeysHandler, user, pass))
	router.GET(path.Join(spinRoute, "/api/stores/:store/keys/:key"), BasicAuth(GetKeyHandler, user, pass))
	router.DELETE(path.Join(spinRoute, "/api/stores/:store/keys/:key"), BasicAuth(DeleteKeyHandler, user, pass))
	router.POST(path.Join(spinRoute, "/api/stores/:store"), BasicAuth(AddKeyHandler, user, pass))

	// We want to allow users to access the UI without basic auth in order to set the credentials.
	// We rely on the browser automatically asking for the basic auth credentials to send to the request.
	router.GET(spinRoute, UIHandler)

	router.ServeHTTP(w, r)
}

// UIHandler is the HTTP handler for the UI of the application.
func UIHandler(w http.ResponseWriter, _ *http.Request, _ spinhttp.Params) {
	out := strings.ReplaceAll(HTMLTemplate, "{{.SpinRoute}}", spinRoute)
	w.Write([]byte(out))

}

// ListKeysHandler is the HTTP handler for a list keys request.
func ListKeysHandler(w http.ResponseWriter, _ *http.Request, p spinhttp.Params) {
	storeName := p.ByName("store")

	store, err := kv.OpenStore(storeName)
	if err != nil {
		logger.Printf("ERROR: cannot open store: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	start := time.Now()
	keys, err := store.GetKeys()
	logger.Printf("LIST operation took: %s\n", time.Since(start))
	if err != nil {
		logger.Printf("ERROR: cannot list keys: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := ListResult{Store: storeName, Keys: keys}
	json.NewEncoder(w).Encode(res)
}

// GetKeyHandler is the HTTP handler for a get key request.
func GetKeyHandler(w http.ResponseWriter, _ *http.Request, p spinhttp.Params) {
	storeName := p.ByName("store")
	key := p.ByName("key")
	safeKey := DecodeSafeKey(key)

	store, err := kv.OpenStore(storeName)
	if err != nil {
		logger.Printf("ERROR: cannot open store: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	start := time.Now()
	value, err := store.Get(string(safeKey))
	logger.Printf("GET operation took %s\n", time.Since(start))
	if err != nil {
		logger.Printf("ERROR: cannot get key: %v\n", err)
		w.WriteHeader(http.StatusNotFound)
	}

	res := GetResult{Store: storeName, Key: key, Value: value}
	json.NewEncoder(w).Encode(res)

}

// DeleteKeyHandler is the HTTP handler for a delete key request.
func DeleteKeyHandler(w http.ResponseWriter, _ *http.Request, p spinhttp.Params) {
	storeName := p.ByName("store")
	key := p.ByName("key")
	safeKey := DecodeSafeKey(key)

	store, err := kv.OpenStore(storeName)
	if err != nil {
		logger.Printf("ERROR: cannot open store: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	start := time.Now()
	err = store.Delete(string(safeKey))
	logger.Printf("DELETE operation took %s\n", time.Since(start))
	if err != nil {
		logger.Printf("ERROR: cannot delete key: %v\n", err)
		w.WriteHeader(http.StatusNotFound)
	}
}

// AddKeyHandler is the HTTP handler for an add key/value pair request.
func AddKeyHandler(w http.ResponseWriter, r *http.Request, p spinhttp.Params) {
	storeName := p.ByName("store")

	var input SetRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	store, err := kv.OpenStore(storeName)
	if err != nil {
		logger.Printf("ERROR: cannot open store: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	start := time.Now()
	err = store.Set(input.Key, []byte(input.Value))
	logger.Printf("SET operation took %s\n", time.Since(start))
	if err != nil {
		logger.Printf("ERROR: cannot add key: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func ShouldSkipAuth() bool {
	val, ok := os.LookupEnv(SKIP_AUTH_ENV)
	return ok && val == "1"
}

// BasicAuth is a middleware that checks for basic auth credentials in a request.
func BasicAuth(h spinhttp.RouterHandle, requiredUser, requiredPassword string) spinhttp.RouterHandle {
	return func(w http.ResponseWriter, r *http.Request, ps spinhttp.Params) {
		// This scenario is only intended for the local scenario, and skips basic authentication
		// when the environment variable is set.
		if ShouldSkipAuth() {
			fmt.Printf("INFO: Skipping authentication\n")
			h(w, r, ps)
			return
		}

		logger.Printf("Authenticating")
		// Get the Basic Authentication credentials
		user, password, hasAuth := r.BasicAuth()

		if hasAuth && subtle.ConstantTimeCompare([]byte(user), []byte(requiredUser)) == 1 && subtle.ConstantTimeCompare([]byte(password), []byte(requiredPassword)) == 1 {
			// Delegate request to the given handle
			h(w, r, ps)
		} else {
			logger.Printf("ERROR: Unauthenticated request\n")
			// Request Basic Authentication otherwise
			w.Header().Set("WWW-Authenticate", "Basic realm=Restricted")
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		}
	}
}

// CredsOrDefault checks the KV store for a `credentials` key, and expects
// the value to be `username:password`. If a value is not found, it will error.
func GetCredentials() (string, string, error) {
	creds, err := variables.Get(KV_STORE_CREDENTIALS_KEY)

	if err != nil {
		fmt.Printf("ERROR: cannot get credentials pair from config store: %v\n", err)
		fmt.Printf("The 'kv_explorer_user' and 'kv_explorer_password' variables for the application are not set. For deployed applications, set the variables using 'spin cloud variables set'. For local development, you can disable authentication using '--env SPIN_APP_KV_SKIP_AUTH=1' or set them in the application using runtime configuration (https://developer.fermyon.com/spin/v2/dynamic-configuration#application-variables-runtime-configuration)\n")
		return "", "", fmt.Errorf("cannot get credentials pair from config store: %v", err)
	}

	split := strings.Split(string(creds), ":")
	return split[0], split[1], nil
}

// Decodes the URI safe code, sent by the client, for GET and DELETE operations
func DecodeSafeKey(key string) []byte {
	base64Key := strings.Replace(key, "-", "/", -1)
	keyAsBytes, err := base64.StdEncoding.DecodeString(base64Key)
	if err != nil {
		logger.Printf("Error decoding key:", err)
	}
	return keyAsBytes
}

func main() {}
