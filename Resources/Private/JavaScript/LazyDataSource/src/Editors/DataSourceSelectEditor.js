import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {SelectBox} from '@neos-project/react-ui-components';
import dataLoader from './lazyDataSourceDataLoader';
import PreviewOption from './PreviewOption';
import {neos} from '@neos-project/neos-ui-decorators';

@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
@dataLoader({isMulti: false})
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
        disabled: PropTypes.bool
    };

    handleValueChange = value => {
        this.props.commit(value);
    }

    render() {
        const {className, value, i18nRegistry, threshold, options, displayLoadingIndicator, onSearchTermChange, disabled} = this.props;

        return (<SelectBox
            className={className}
            displaySearchBox={true}
            noMatchesFoundLabel={i18nRegistry.translate('Neos.Neos:Main:noMatchesFound')}
            searchBoxLeftToTypeLabel={i18nRegistry.translate('Neos.Neos:Main:searchBoxLeftToType')}
            placeholder={i18nRegistry.translate(this.props.placeholder)}
            threshold={threshold}
            options={options}
            value={value}
            onValueChange={this.handleValueChange}
            loadingLabel={i18nRegistry.translate('Neos.Neos:Main:loading')}
            displayLoadingIndicator={displayLoadingIndicator}
            showDropDownToggle={false}
            allowEmpty={true}
            onSearchTermChange={onSearchTermChange}
            disabled={disabled}
            ListPreviewElement={PreviewOption}
            />);
    }
}
