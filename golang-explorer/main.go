package main

import (
	"crypto/subtle"
	_ "embed"
	"encoding/json"
	"log"
	"net/http"

	spinhttp "github.com/fermyon/spin/sdk/go/http"
	kv "github.com/fermyon/spin/sdk/go/key_value"
	"github.com/julienschmidt/httprouter"
)

// At build time, read the contents of index.html and embed it in the `Html` variable.
// The goal for this is having a single wasm binary that can be added using `spin add`.

//go:embed index.html
var Html string

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

func init() {
	// The entry point to a Spin HTTP request using the Go SDK.
	spinhttp.Handle(func(w http.ResponseWriter, r *http.Request) {
		serve(w, r)
	})
}

// Setup the router and handle the incoming request.
func serve(w http.ResponseWriter, r *http.Request) {
	user, pass, err := credsFromKV()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	router := httprouter.New()

	// Access to the list, get, create, and delete KV pairs endpoints is behind basic auth,
	// with the credentials stored in the KV store itself.
	router.GET("/internal/kv-explorer/api/stores/:store", BasicAuth(ListKeysHandler, user, pass))
	router.GET("/internal/kv-explorer/api/stores/:store/keys/:key", BasicAuth(GetKeyHandler, user, pass))
	router.DELETE("/internal/kv-explorer/api/stores/:store/keys/:key", BasicAuth(DeleteKeyHandler, user, pass))
	router.POST("/internal/kv-explorer/api/stores/:store", BasicAuth(AddKeyHandler, user, pass))

	// We want to users to access the UI without basic auth in order to set the credentials.
	// We rely on the browser automatically asking for the basic auth credentials to send to the request.
	router.GET("/internal/kv-explorer", UIHandler)

	router.ServeHTTP(w, r)
}

// UIHandler is the HTTP handler for the UI of the application.
func UIHandler(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	w.Write([]byte(Html))
}

// ListKeysHandler is the HTTP handler for a list keys request.
func ListKeysHandler(w http.ResponseWriter, _ *http.Request, p httprouter.Params) {
	storeName := p.ByName("store")
	log.Printf("Listing keys from store: %s", storeName)

	store, err := kv.Open(storeName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer kv.Close(store)

	keys, err := kv.GetKeys(store)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := ListResult{Store: storeName, Keys: keys}
	json.NewEncoder(w).Encode(res)
}

// GetKeyHandler is the HTTP handler for a get key request.
func GetKeyHandler(w http.ResponseWriter, _ *http.Request, p httprouter.Params) {
	storeName := p.ByName("store")
	key := p.ByName("key")
	log.Printf("Getting the value of key %s from store: %s", key, storeName)

	store, err := kv.Open(storeName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer kv.Close(store)

	value, err := kv.Get(store, key)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
	} else {
		res := GetResult{Store: storeName, Key: key, Value: value}
		json.NewEncoder(w).Encode(res)
	}
}

// DeleteKeyHandler is the HTTP handler for a delete key request.
func DeleteKeyHandler(w http.ResponseWriter, _ *http.Request, p httprouter.Params) {
	storeName := p.ByName("store")
	key := p.ByName("key")
	log.Printf("Deleting the value of key %s from store: %s", key, storeName)

	store, err := kv.Open(storeName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer kv.Close(store)

	exists, err := kv.Exists(store, key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else if exists {
		_ = kv.Delete(store, key)
	} else {
		w.WriteHeader(http.StatusNotFound)
	}
}

// AddKeyHandler is the HTTP handler for an add key/value pair request.
func AddKeyHandler(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	storeName := p.ByName("store")

	var input SetRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	log.Printf("Adding new value in store %s. Input: %s. Value: %s", storeName, input.Key, input.Value)

	store, err := kv.Open(storeName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer kv.Close(store)

	err = kv.Set(store, input.Key, []byte(input.Value))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// BasicAuth is a middleware that checks for basic auth credentials in a request.
func BasicAuth(h httprouter.Handle, requiredUser, requiredPassword string) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		// Get the Basic Authentication credentials
		user, password, hasAuth := r.BasicAuth()

		if hasAuth && subtle.ConstantTimeCompare([]byte(user), []byte(requiredUser)) == 1 && subtle.ConstantTimeCompare([]byte(password), []byte(requiredPassword)) == 1 {
			// Delegate request to the given handle
			h(w, r, ps)
		} else {
			// Request Basic Authentication otherwise
			w.Header().Set("WWW-Authenticate", "Basic realm=Restricted")
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		}
	}
}

func credsFromKV() (string, string, error) {
	store, err := kv.Open("default")
	if err != nil {
		return "", "", err
	}
	user, err := kv.Get(store, "user")
	if err != nil {
		return "", "", err
	}
	pass, err := kv.Get(store, "password")
	if err != nil {
		return "", "", err
	}

	return string(user), string(pass), nil
}

func main() {}
