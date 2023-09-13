import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {SelectBox, MultiSelectBox} from '@neos-project/react-ui-components';
import {neos} from '@neos-project/neos-ui-decorators';

import dataLoader from './lazyDataSourceDataLoader';
import PreviewOption from './PreviewOption';

// COPIED FROM @neos-project/neos-ui-constants/src/dndTypes (as we do not expose this yet).
const dndTypes = {
    NODE: 'neos-tree-node',
    MULTISELECT: 'neos-multiselect-value'
};

@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
@dataLoader()
export default class DataSourceSelectEditor extends PureComponent {
    static propTypes = {
        value: PropTypes.string,
        className: PropTypes.string,
        options: PropTypes.array,
        searchOptions: PropTypes.array,
        placeholder: PropTypes.string,
        displayLoadingIndicator: PropTypes.bool,
        threshold: PropTypes.number,
        onSearchTermChange: PropTypes.func,
        commit: PropTypes.func.isRequired,
        i18nRegistry: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
        multiple: PropTypes.bool,
    };

    handleValueChange = value => {
        this.props.commit(value);
    }

    render() {
        const {
            className,
            value,
            i18nRegistry,
            threshold,
            options,
            displayLoadingIndicator,
            onSearchTermChange,
            disabled,
            placeholder,
            searchOptions,
            multiple,
        } = this.props;

        return multiple ? <MultiSelectBox
            className={className}
            displaySearchBox={true}
            noMatchesFoundLabel={i18nRegistry.translate('Neos.Neos:Main:noMatchesFound')}
            loadingLabel={i18nRegistry.translate('Neos.Neos:Main:loading')}
            searchBoxLeftToTypeLabel={i18nRegistry.translate('Neos.Neos:Main:searchBoxLeftToType')}
            placeholder={i18nRegistry.translate(placeholder)}
            threshold={threshold}
            options={options}
            values={value}
            onValuesChange={this.handleValueChange}
            displayLoadingIndicator={displayLoadingIndicator}
            showDropDownToggle={false}
            allowEmpty={true}
            onSearchTermChange={onSearchTermChange}
            ListPreviewElement={PreviewOption}
            disabled={disabled}
            searchOptions={searchOptions}
            dndType={dndTypes.MULTISELECT}
        /> : <SelectBox
            className={className}
            displaySearchBox={true}
            noMatchesFoundLabel={i18nRegistry.translate('Neos.Neos:Main:noMatchesFound')}
            loadingLabel={i18nRegistry.translate('Neos.Neos:Main:loading')}
            searchBoxLeftToTypeLabel={i18nRegistry.translate('Neos.Neos:Main:searchBoxLeftToType')}
            placeholder={i18nRegistry.translate(placeholder)}
            threshold={threshold}
            options={options}
            value={value}
            onValueChange={this.handleValueChange}
            displayLoadingIndicator={displayLoadingIndicator}
            showDropDownToggle={false}
            allowEmpty={true}
            onSearchTermChange={onSearchTermChange}
            ListPreviewElement={PreviewOption}
            disabled={disabled}
        />;
    }
}
