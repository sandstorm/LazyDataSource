import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {MultiSelectBox} from '@neos-project/react-ui-components';
import dataLoader from './lazyDataSourceDataLoader';
import {neos} from '@neos-project/neos-ui-decorators';

// COPIED FROM @neos-project/neos-ui-constants/src/dndTypes (as we do not expose this yet).
const dndTypes = {
    NODE: 'neos-tree-node',
    MULTISELECT: 'neos-multiselect-value'
};

@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
@dataLoader({isMulti: true})
export default class DataSourceMultiSelectEditor extends PureComponent {
    static propTypes = {
        value: PropTypes.arrayOf(PropTypes.string),
        options: PropTypes.array,
        searchOptions: PropTypes.array,
        placeholder: PropTypes.string,
        displayLoadingIndicator: PropTypes.bool,
        threshold: PropTypes.number,
        onSearchTermChange: PropTypes.func,
        onCreateNew: PropTypes.func,
        commit: PropTypes.func.isRequired,
        i18nRegistry: PropTypes.object.isRequired,
        disabled: PropTypes.bool
    };

    handleValueChange = value => {
        this.props.commit(value);
    }

    render() {
        const {className, i18nRegistry, threshold, placeholder, options, value, displayLoadingIndicator, searchOptions, onSearchTermChange, onCreateNew, disabled} = this.props;

        return (<MultiSelectBox
            className={className}
            dndType={dndTypes.MULTISELECT}
            loadingLabel={i18nRegistry.translate('Neos.Neos:Main:loading')}
            displaySearchBox={true}
            placeholder={i18nRegistry.translate(placeholder)}
            threshold={threshold}
            noMatchesFoundLabel={i18nRegistry.translate('Neos.Neos:Main:noMatchesFound')}
            searchBoxLeftToTypeLabel={i18nRegistry.translate('Neos.Neos:Main:searchBoxLeftToType')}
            options={options}
            values={value}
            onValuesChange={this.handleValueChange}
            displayLoadingIndicator={displayLoadingIndicator}
            showDropDownToggle={false}
            allowEmpty={true}
            searchOptions={searchOptions}
            onSearchTermChange={onSearchTermChange}
            disabled={disabled}
            />);
    }
}
