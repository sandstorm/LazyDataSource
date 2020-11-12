# Sandstorm.LazyDataSource

[Inspector Data Sources](https://docs.neos.io/cms/manual/extending-neos-with-php-flow/custom-data-sources)
in Neos are usually *eager*, this means the UI sends a single request to the backend to load all options,
and then doing the filtering client-side.

This package implements additional Inspector Editors, behaving like the standard SelectBoxEditor with
data sources, but **delegates filtering and searching to the server-side**.

This greatly improves Neos UI performance for data sources with big collections (100s of elements).

## Getting started

1. Default composer installation  via:

    ```shell
    composer require sandstorm/lazydatasource
    ```

2. **for a single select:**

   In your `NodeTypes.yaml`, activate the custom editor by using `Sandstorm.LazyDataSource/Inspector/Editors/DataSourceSelectEditor`
   instead of `Neos.Neos/Inspector/Editors/SelectBoxEditor`. **All configuration options [of the data source-based select](https://neos.readthedocs.io/en/stable/References/PropertyEditorReference.html#property-type-string-array-string-selectboxeditor-dropdown-select-editor)
   apply as usual.
   
   Example:
   
   ```yaml
   'Neos.Demo:Document.Page':
     properties:
       test:
         ui:
           inspector:
             group: 'document'
   
             ##### THIS IS THE RELEVANT CONFIG:
             editor: 'Sandstorm.LazyDataSource/Inspector/Editors/DataSourceSelectEditor'
             
             ##### all Select options (e.g. dataSourceAdditionalData) work as usual. 
             editorOptions:
               placeholder: Choose
               dataSourceIdentifier: lazy-editor-test
   ```

3. **for a multi select:**

   In your `NodeTypes.yaml`, activate the custom editor by using `Sandstorm.LazyDataSource/Inspector/Editors/DataSourceMultiSelectEditor`
   instead of `Neos.Neos/Inspector/Editors/SelectBoxEditor`. **All configuration options [of the data source-based select](https://neos.readthedocs.io/en/stable/References/PropertyEditorReference.html#property-type-string-array-string-selectboxeditor-dropdown-select-editor)
   apply as usual.
   
   Example:
   
   ```yaml
   'Neos.Demo:Document.Page':
     properties:
       test2:

         ##### Do not forget to set the property type to array<string>
         type: array<string>
         ui:
           inspector:
             group: 'document'
   
             ##### THIS IS THE RELEVANT CONFIG:
             editor: 'Sandstorm.LazyDataSource/Inspector/Editors/DataSourceMultiSelectEditor'
             
             ##### all Select options (e.g. dataSourceAdditionalData) work as usual. 
             editorOptions:
               placeholder: Choose
               dataSourceIdentifier: lazy-editor-test
   ```
   
   **Do not forget to set the property type to `array<string>`.

4. In your `DataSource` implementation on the server, use the `LazyDataSourceTrait` and implement the two methods `getDataForIdentifiers()`
   and `searchData()`. Do not implement `getData()` (as this is provided by the trait).
   
   - `getDataForIdentifiers()` is called during the initial call, when the client-side needs to resolve entries for certain identifiers.
   - `searchData()` is called when the user has entered a search term, and needs to perform the searching.
   
   The return value for both methods needs to be the same as for normal data sources.
   
   Example:
   
   ```php
    use Neos\Neos\Service\DataSource\AbstractDataSource;
    use Neos\ContentRepository\Domain\Model\NodeInterface;
    
    class MyLazyDataSource extends AbstractDataSource
    {
    
        use LazyDataSourceTrait;
    
        static protected $identifier = 'lazy-editor-test';
    
        protected function getDataForIdentifiers(array $identifiers, NodeInterface $node = null, array $arguments = [])
        {
            $options = [];
            foreach ($identifiers as $id) {
                $options[$id] = ['label' => 'My Label for ' . $id];
            }
            return $options;
        }
    
        protected function searchData(string $searchTerm, NodeInterface $node = null, array $arguments = [])
        {
            $options = [];
            $options['key'] = ['label' => 'My Label ' . $searchTerm];
            return $options;
        }
    }

   ```

## Development 
This project works with yarn. The build process given by the neos developers is not very
configurable, only the target dir for the buildprocess is adjustable by 
package.json.

```shell
nvm install
```

If you don't have [yarn](https://yarnpkg.com/lang/en/docs/install/) already installed: 

```shell
brew install yarn
```

Build the app:

```shell
./build.sh
```

## Contribute

You are very welcome to contribute by merge requests, adding issues etc.
