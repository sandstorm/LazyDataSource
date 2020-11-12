import HLRU from 'hashlru';
import manifest from '@neos-project/neos-ui-extensibility';
import backend from '@neos-project/neos-ui-backend-connector';
import DataSourceMultiSelectEditor from './Editors/DataSourceMultiSelectEditor';
import DataSourceSelectEditor from './Editors/DataSourceSelectEditor';


function makeCacheKey(prefix, params) {
    if (params.options && params.options.dataSourceMakeNodeIndependent) {
        // if dataSourceMakeNodeIndependent, remove contextNodePath from the cache key.
        params = JSON.parse(JSON.stringify(params)); // Deep copy
        delete params.options.contextNodePath;
    }
    const cacheKey = prefix + JSON.stringify(params);

    console.log("CC", cacheKey);
    return cacheKey;
}

manifest('Sandstorm.LazyDataSource:Plugin', {}, (globalRegistry, {frontendConfiguration}) => {

    const editorsRegistry = globalRegistry.get('inspector').get('editors');

    editorsRegistry.set('Sandstorm.LazyDataSource/Inspector/Editors/DataSourceSelectEditor', {
        component: DataSourceSelectEditor
    });

    editorsRegistry.set('Sandstorm.LazyDataSource/Inspector/Editors/DataSourceMultiSelectEditor', {
        component: DataSourceMultiSelectEditor
    });


    const dataLoadersRegistry = globalRegistry.get('dataLoaders');
    dataLoadersRegistry.set('SandstormLazyDataSourceLoader', {
        description: `
            Look up Data Source values:

            - by identifier (resolveValue())
            - by searching in data source (search())

            OPTIONS:
            - contextNodePath: ...
            - dataSourceIdentifier: The data source to load. Either this or dataSourceUri is required.
            - dataSourceUri: The data source URL to load.
            - dataSourceDisableCaching: Disable default _lru caching option.
            - dataSourceAdditionalData: Additional data to send to the server

            EXTRA OPTIONS:
            - dataSourceMakeNodeIndependent: If set to TRUE, the dataLoader is not transmitting the currently selected node
              to the backend; increasing the cache lifetime for the dataloaders in the client (e.g. the system can re-use
              elements from other nodes)
        `,

        _lru() {
            if (!this._lruCache) {
                this._lruCache = new HLRU(500);
            }
            return this._lruCache;
        },

        resolveValue(options, identifier) {
            return this.resolveValues(options, [identifier]);
        },

        // modelled as a combination of DataSources and NodeLookup data loaders. The rough
        // structure is the NodeLookup data loader; but the querying part is the DataSources data loader.
        resolveValues(options, identifiers) {
            const resultPromisesByIdentifier = {};
            const identifiersNotInCache = [];

            identifiers.forEach(identifier => {
                const cacheKey = makeCacheKey('resolve', {options, identifier});

                if (this._lru().has(cacheKey)) {
                    resultPromisesByIdentifier[identifier] = this._lru().get(cacheKey);
                } else {
                    identifiersNotInCache.push(identifier);
                }
            });

            let result;
            if (identifiersNotInCache.length > 0) {
                // Build up query
                const params = Object.assign(options.dataSourceMakeNodeIndependent ? {} : {node: options.contextNodePath}, options.dataSourceAdditionalData || {}, {
                    identifiers: identifiersNotInCache
                });
                // Trigger query
                const dataSourceApi = backend.get().endpoints.dataSource;
                result = dataSourceApi(options.dataSourceIdentifier, options.dataSourceUri, params).then(results => {
                    const resultsAsArray = Object.keys(results).map(identifier => ({
                        ...(results[identifier]),
                        value: identifier
                    }));

                    // We store the result in the cache
                    resultsAsArray.forEach(result => {
                        const cacheKey = makeCacheKey('resolve', {options, identifier: result.value});
                        const resultPromise = Promise.resolve(result);
                        if (!options.dataSourceDisableCaching) {
                            this._lru().set(cacheKey, resultPromise);
                        }
                        resultPromisesByIdentifier[result.value] = resultPromise;
                    });

                    // By now, all identifiers are in cache.
                    return Promise.all(
                        identifiers.map(identifier =>
                            resultPromisesByIdentifier[identifier]
                        ).filter(promise => Boolean(promise)) // Remove "null" values
                    );
                });
            } else {
                // We know all identifiers are in cache.
                result = Promise.all(
                    identifiers.map(identifier =>
                        resultPromisesByIdentifier[identifier]
                    ).filter(promise => Boolean(promise)) // Remove "null" values
                );
            }

            return result;
        },

        search(options, searchTerm) {
            if (!searchTerm) {
                return Promise.resolve([]);
            }

            const cacheKey = makeCacheKey('search', {options, searchTerm});
            if (this._lru().has(cacheKey)) {
                return this._lru().get(cacheKey);
            }

            // Debounce AJAX requests for 300 ms
            return new Promise(resolve => {
                if (this._debounceTimer) {
                    window.clearTimeout(this._debounceTimer);
                }
                this._debounceTimer = window.setTimeout(resolve, 300);
            }).then(() => {
                // Build up query
                const searchQuery = Object.assign(options.dataSourceMakeNodeIndependent ? {} : {node: options.contextNodePath}, options.dataSourceAdditionalData || {}, {
                    searchTerm
                });

                // Trigger query
                const dataSourceApi = backend.get().endpoints.dataSource;
                const resultPromise = dataSourceApi(options.dataSourceIdentifier, options.dataSourceUri, searchQuery).then(results => {
                    return Object.keys(results).map(identifier => ({
                        ...(results[identifier]),
                        value: identifier
                    }));
                });
                if (!options.dataSourceDisableCaching) {
                    this._lru().set(cacheKey, resultPromise);
                }

                // Next to storing the full result in the cache, we also store each individual result in the cache;
                // in the same format as expected by resolveValue(); so that it is already loaded and does not need
                // to be loaded once the element has been selected.
                return resultPromise.then(results => {
                    results.forEach(result => {
                        const cacheKey = makeCacheKey('resolve', {options, identifier: result.value});
                        if (!options.dataSourceDisableCaching) {
                            this._lru().set(cacheKey, Promise.resolve(result));
                        }
                    });

                    return results;
                });
            });
        }
    });
});
