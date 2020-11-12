import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {$get, $transform} from 'plow-js';
import {neos} from '@neos-project/neos-ui-decorators';
import {selectors} from '@neos-project/neos-ui-redux-store';
import {connect} from 'react-redux';

export default ({isMulti}) => WrappedComponent => {
    @neos(globalRegistry => ({
        lazyDataSourceDataLoader: globalRegistry.get('dataLoaders').get('SandstormLazyDataSourceLoader')
    }))
    @connect($transform({
        focusedNodePath: selectors.CR.Nodes.focusedNodePathSelector
    }))
    class LazyDataSourceDataLoader extends PureComponent {
        static propTypes = {
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
            options: PropTypes.shape({
                dataSourceIdentifier: PropTypes.string,
                dataSourceUri: PropTypes.string,
                dataSourceDisableCaching: PropTypes.bool,
                dataSourceAdditionalData: PropTypes.objectOf(PropTypes.any),

                // If dataSourceMakeNodeIndependent is TRUE, the dataLoader is not transmitting the currently selected node
                // to the backend; increasing the cache lifetime for the dataloaders in the client (e.g. the system can re-use
                // elements from other nodes)
                dataSourceMakeNodeIndependent: PropTypes.bool,
            }),

            lazyDataSourceDataLoader: PropTypes.shape({
                resolveValue: PropTypes.func.isRequired,
                resolveValues: PropTypes.func.isRequired,
                search: PropTypes.func.isRequired
            }).isRequired,
            focusedNodePath: PropTypes.string,
        };

        state = {
            isLoading: false,
            options: [],
            searchOptions: [],
            results: []
        };

        componentDidMount() {
            this.resolveValue();
        }

        componentDidUpdate(prevProps) {
            if (prevProps.value !== this.props.value) {
                this.resolveValue();
            }
        }

        resolveValue = () => {
            const valueProvided = isMulti ? Array.isArray(this.props.value) : this.props.value;
            if (valueProvided) {
                this.setState({isLoading: true});
                const resolver = isMulti ? this.props.lazyDataSourceDataLoader.resolveValues.bind(this.props.lazyDataSourceDataLoader) : this.props.lazyDataSourceDataLoader.resolveValue.bind(this.props.lazyDataSourceDataLoader);
                resolver(this.getDataLoaderOptions(), this.props.value)
                    .then(options => {
                        this.setState({
                            isLoading: false,
                            options
                        });
                    });
            }
        }

        handleSearchTermChange = searchTerm => {
            if (searchTerm) {
                this.setState({isLoading: true, searchOptions: []});
                this.props.lazyDataSourceDataLoader.search(this.getDataLoaderOptions(), searchTerm)
                    .then(searchOptions => {
                        this.setState({
                            isLoading: false,
                            searchOptions
                        });
                    });
            } else {
                this.setState({
                    isLoading: false,
                    searchOptions: []
                });
            }
        }

        getDataLoaderOptions() {
            return {
                contextNodePath: this.props.focusedNodePath,
                dataSourceIdentifier: this.props.options.dataSourceIdentifier,
                dataSourceUri: this.props.options.dataSourceUri,
                dataSourceAdditionalData: this.props.options.dataSourceAdditionalData,
                dataSourceDisableCaching: Boolean(this.props.options.dataSourceDisableCaching),
                dataSourceMakeNodeIndependent: Boolean(this.props.options.dataSourceMakeNodeIndependent)
            };
        }

        render() {
            const props = Object.assign({}, this.props, this.state);
            const options = isMulti ? this.state.options : (this.props.value ? this.state.options : this.state.searchOptions);
            return (
                <WrappedComponent
                    {...props}
                    options={options}
                    searchOptions={this.state.searchOptions}
                    displayLoadingIndicator={this.state.isLoading}
                    onSearchTermChange={this.handleSearchTermChange}
                    placeholder={this.props.options.placeholder}
                    threshold={this.props.options.threshold}
                    />
            );
        }
    }
    return LazyDataSourceDataLoader;
};
