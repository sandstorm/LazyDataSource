import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {$transform} from 'plow-js';

import {neos} from '@neos-project/neos-ui-decorators';
import {selectors} from '@neos-project/neos-ui-redux-store';

export default () => WrappedComponent => {
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
                multiple: PropTypes.bool,

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
            const { value, options, lazyDataSourceDataLoader } = this.props;
            const valueProvided = options.multiple ? Array.isArray(value) : value;
            if (valueProvided) {
                this.setState({isLoading: true});
                const resolver = options.multiple ? lazyDataSourceDataLoader.resolveValues.bind(lazyDataSourceDataLoader) : lazyDataSourceDataLoader.resolveValue.bind(lazyDataSourceDataLoader);
                resolver(this.getDataLoaderOptions(), value)
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
            const { options, value } = this.props;
            const { isLoading, searchOptions } = this.state;

            const config = Object.assign({}, this.props, this.state);
            const componentOptions = options.multiple || value ? this.state.options : searchOptions;

            return (
                <WrappedComponent
                    {...config}
                    options={componentOptions}
                    searchOptions={searchOptions}
                    displayLoadingIndicator={isLoading}
                    onSearchTermChange={this.handleSearchTermChange}
                    placeholder={options.placeholder}
                    threshold={options.threshold}
                    multiple={options.multiple}
                />
            );
        }
    }
    return LazyDataSourceDataLoader;
};
