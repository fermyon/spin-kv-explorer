package main

import (
	"crypto/rand"
	"crypto/subtle"
	_ "embed"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"

	spin "github.com/fermyon/spin/sdk/go/http"
	kv "github.com/fermyon/spin/sdk/go/key_value"
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
	spin.Handle(func(w http.ResponseWriter, r *http.Request) {
		serve(w, r)
	})
}

// Setup the router and handle the incoming request.
func serve(w http.ResponseWriter, r *http.Request) {
	user, pass, err := GetCredentials()
	if err != nil {
		log.Printf("Error getting credentials from KV store: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	router := spin.NewRouter()

	// Access to the list, get, create, and delete KV pairs endpoints is behind basic auth,
	// with the credentials stored in the KV store itself.
	router.GET("/internal/kv-explorer/api/stores/:store", BasicAuth(ListKeysHandler, user, pass))
	router.GET("/internal/kv-explorer/api/stores/:store/keys/:key", BasicAuth(GetKeyHandler, user, pass))
	router.DELETE("/internal/kv-explorer/api/stores/:store/keys/:key", BasicAuth(DeleteKeyHandler, user, pass))
	router.POST("/internal/kv-explorer/api/stores/:store", BasicAuth(AddKeyHandler, user, pass))

	// We want to allow users to access the UI without basic auth in order to set the credentials.
	// We rely on the browser automatically asking for the basic auth credentials to send to the request.
	router.GET("/internal/kv-explorer", UIHandler)

	router.ServeHTTP(w, r)
}

// UIHandler is the HTTP handler for the UI of the application.
func UIHandler(w http.ResponseWriter, _ *http.Request, _ spin.Params) {
	w.Write([]byte(Html))
}

// ListKeysHandler is the HTTP handler for a list keys request.
func ListKeysHandler(w http.ResponseWriter, _ *http.Request, p spin.Params) {
	storeName := p.ByName("store")

	store, err := kv.Open(storeName)
	if err != nil {
		log.Printf("ERROR: cannot open store: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer kv.Close(store)

	keys, err := kv.GetKeys(store)
	if err != nil {
		log.Printf("ERROR: cannot list keys: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := ListResult{Store: storeName, Keys: keys}
	json.NewEncoder(w).Encode(res)
}

// GetKeyHandler is the HTTP handler for a get key request.
func GetKeyHandler(w http.ResponseWriter, _ *http.Request, p spin.Params) {
	storeName := p.ByName("store")
	key := p.ByName("key")

	store, err := kv.Open(storeName)
	if err != nil {
		log.Printf("ERROR: cannot open store: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer kv.Close(store)

	value, err := kv.Get(store, key)
	if err != nil {
		log.Printf("ERROR: cannot get key: %v", err)
		w.WriteHeader(http.StatusNotFound)
	}

	res := GetResult{Store: storeName, Key: key, Value: value}
	json.NewEncoder(w).Encode(res)

}

// DeleteKeyHandler is the HTTP handler for a delete key request.
func DeleteKeyHandler(w http.ResponseWriter, _ *http.Request, p spin.Params) {
	storeName := p.ByName("store")
	key := p.ByName("key")

	store, err := kv.Open(storeName)
	if err != nil {
		log.Printf("ERROR: cannot open store: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer kv.Close(store)

	err = kv.Delete(store, key)
	if err != nil {
		log.Printf("ERROR: cannot delete key: %v", err)
		w.WriteHeader(http.StatusNotFound)
	}
}

// AddKeyHandler is the HTTP handler for an add key/value pair request.
func AddKeyHandler(w http.ResponseWriter, r *http.Request, p spin.Params) {
	storeName := p.ByName("store")

	var input SetRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	store, err := kv.Open(storeName)
	if err != nil {
		log.Printf("ERROR: cannot open store: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer kv.Close(store)

	err = kv.Set(store, input.Key, []byte(input.Value))
	if err != nil {
		log.Printf("ERROR: cannot add key: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// BasicAuth is a middleware that checks for basic auth credentials in a request.
func BasicAuth(h spin.RouterHandle, requiredUser, requiredPassword string) spin.RouterHandle {
	return func(w http.ResponseWriter, r *http.Request, ps spin.Params) {
		// Get the Basic Authentication credentials
		user, password, hasAuth := r.BasicAuth()

		if hasAuth && subtle.ConstantTimeCompare([]byte(user), []byte(requiredUser)) == 1 && subtle.ConstantTimeCompare([]byte(password), []byte(requiredPassword)) == 1 {
			// Delegate request to the given handle
			h(w, r, ps)
		} else {
			log.Printf("ERROR: Unauthenticated request")
			// Request Basic Authentication otherwise
			w.Header().Set("WWW-Authenticate", "Basic realm=Restricted")
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		}
	}
}

// CredsOrDefault checks the KV store for a `credentials` key, and expects
// the value to be `username:password`. If a value is not found, this function
// will generate a random pair and log it once.
func GetCredentials() (string, string, error) {
	store, err := kv.Open("default")
	if err != nil {
		log.Printf("ERROR: cannot open store: %v", err)
		return "", "", fmt.Errorf("error opening store: %v", err)
	}

	exists, err := kv.Exists(store, "credentials")
	if err != nil {
		return "", "", fmt.Errorf("cannot check if credentials exists: %v", err)
	}

	if !exists {
		defaultUser, err := GenerateRandomString(10)
		if err != nil {
			return "", "", fmt.Errorf("failed to generate random string for user: %v", err)
		}
		defaultPassword, err := GenerateRandomString(30)
		if err != nil {
			return "", "", fmt.Errorf("failed to generate random string for password: %v", err)
		}

		kv.Set(store, "credentials", []byte(defaultUser+":"+defaultPassword))

		log.Printf("Default user: %v", defaultUser)
		log.Printf("Default password: %v", defaultPassword)
		log.Printf("This is a randomly generated username and password pair. To change it, please add a `credentials` key in the default store with the value `username:password`. If you delete the credential pair, the next request will generate a new random set.")

		return defaultUser, defaultPassword, nil
	}

	creds, err := kv.Get(store, "credentials")
	if err != nil {
		return "", "", fmt.Errorf("cannot get credentials pair from store: %v", err)
	}

	split := strings.Split(string(creds), ":")
	return split[0], split[1], nil
}

// GenerateRandomString returns a securely generated random string.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func GenerateRandomString(n int) (string, error) {
	const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-!@#$%^&*"
	ret := make([]byte, n)
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			return "", err
		}
		ret[i] = chars[num.Int64()]
	}

	return string(ret), nil
}

func main() {}
